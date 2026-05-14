from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str
    metrics: dict


def load_image(path: Path) -> np.ndarray:
    image = Image.open(path).convert("RGB")
    return np.array(image)


def near_color(arr: np.ndarray, color: tuple[int, int, int], tol: int) -> np.ndarray:
    target = np.array(color, dtype=np.int16)
    diff = np.abs(arr.astype(np.int16) - target)
    return np.all(diff <= tol, axis=2)


def find_popup_rect(image: np.ndarray) -> tuple[int, int, int, int] | None:
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    mask = cv2.inRange(gray, 235, 255)
    kernel = np.ones((9, 9), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    h, w = gray.shape
    candidates: list[tuple[int, int, int, int]] = []
    for contour in contours:
        x, y, cw, ch = cv2.boundingRect(contour)
        area_ratio = (cw * ch) / (w * h)
        if area_ratio < 0.18:
            continue
        if x <= 0 or y <= 0 or x + cw >= w - 1 or y + ch >= h - 1:
            continue
        candidates.append((x, y, cw, ch))
    if not candidates:
        return None
    return max(candidates, key=lambda item: item[2] * item[3])


def detect_blue_markers(image: np.ndarray, popup: tuple[int, int, int, int]) -> list[tuple[int, int, int, int]]:
    x, y, w, h = popup
    roi = image[y : y + h, x : x + w]
    hsv = cv2.cvtColor(roi, cv2.COLOR_RGB2HSV)
    mask = cv2.inRange(hsv, np.array([80, 40, 60]), np.array([140, 255, 255]))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    markers = []
    for contour in contours:
        bx, by, bw, bh = cv2.boundingRect(contour)
        if bx > int(w * 0.08):
            continue
        if by < int(h * 0.28):
            continue
        if bw > 12 or bh < 10 or bh > 40:
            continue
        if bw * bh < 35:
            continue
        markers.append((bx + x, by + y, bw, bh))
    markers.sort(key=lambda item: item[1])
    deduped = []
    for marker in markers:
        if not deduped or abs(marker[1] - deduped[-1][1]) > 20:
            deduped.append(marker)
    return deduped


def detect_pagination(image: np.ndarray, popup: tuple[int, int, int, int], markers: list[tuple[int, int, int, int]]) -> bool:
    x, y, w, h = popup
    top = y + int(h * 0.68)
    bottom = y + int(h * 0.9)
    roi = image[top:bottom, x + int(w * 0.62) : x + w]
    hsv = cv2.cvtColor(roi, cv2.COLOR_RGB2HSV)
    mask = cv2.inRange(hsv, np.array([80, 40, 80]), np.array([140, 255, 255]))
    blue_pixels = int(mask.sum() / 255)
    return blue_pixels > 450


def detect_graph_center(image: np.ndarray, popup: tuple[int, int, int, int], markers: list[tuple[int, int, int, int]]) -> bool:
    if len(markers) < 2:
        return False
    x, y, w, h = popup
    search_top = markers[1][1] - 140
    search_top = max(y + int(h * 0.38), search_top)
    roi = image[search_top : y + h, x : x + w]
    hsv = cv2.cvtColor(roi, cv2.COLOR_RGB2HSV)
    mask = cv2.inRange(hsv, np.array([80, 40, 60]), np.array([140, 255, 255]))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for contour in contours:
        bx, by, bw, bh = cv2.boundingRect(contour)
        area = bw * bh
        center_x = bx + bw / 2
        if area > 700 and int(w * 0.35) < center_x < int(w * 0.65):
            return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--prompt-doc", required=True)
    parser.add_argument("--record-doc", required=True)
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--output-md", required=True)
    args = parser.parse_args()

    image_path = Path(args.image)
    prompt_doc = Path(args.prompt_doc)
    record_doc = Path(args.record_doc)
    output_json = Path(args.output_json)
    output_md = Path(args.output_md)

    image = load_image(image_path)
    h, w, _ = image.shape
    prompt_text = prompt_doc.read_text(encoding="utf-8")
    record_text = record_doc.read_text(encoding="utf-8")

    popup = find_popup_rect(image)
    popup_found = popup is not None
    px = py = pw = ph = 0
    if popup_found:
        px, py, pw, ph = popup
    popup_ratio = (pw * ph) / (w * h) if popup_found else 0.0
    popup_center_offset = abs((px + pw / 2) - (w / 2)) / w if popup_found else 1.0

    top_bar = image[: max(1, int(h * 0.06)), :, :]
    dark_top_ratio = float(np.mean(np.mean(top_bar, axis=2) < 70))

    left_bar = image[:, : max(1, int(w * 0.11)), :]
    dark_left_ratio = float(np.mean(np.mean(left_bar, axis=2) < 90))

    gray_mask = near_color(image, (242, 243, 247), 14)
    gray_ratio = float(np.mean(gray_mask))

    markers = detect_blue_markers(image, popup) if popup_found else []
    pagination_found = detect_pagination(image, popup, markers) if popup_found else False
    graph_center_found = detect_graph_center(image, popup, markers) if popup_found else False

    version_match = re.search(r"v(\d+)\.png$", image_path.name)
    version_num = int(version_match.group(1)) if version_match else -1
    version_line_exists = f"| v{version_num:02d} |" in record_text or f"| v{version_num} |" in record_text
    prompt_doc_updated = (
        f"v{version_num:02d} 使用说明" in prompt_text
        and f"v{version_num:02d} 纯生图提示词" in prompt_text
    )
    record_prompt_exists = f"v{version_num:02d} 实际出图提示词" in record_text

    checks = [
        CheckResult(
            name="image_exists_and_versioned",
            passed=image_path.exists() and version_num > 0,
            detail=f"新版本图片存在，且版本号为 v{version_num:02d}",
            metrics={"path": str(image_path), "version_num": version_num, "size": [w, h]},
        ),
        CheckResult(
            name="prompt_doc_updated",
            passed=prompt_doc_updated,
            detail=f"提示词文档已追加 v{version_num:02d} 使用说明与纯生图提示词",
            metrics={
                "has_usage": f"v{version_num:02d} 使用说明" in prompt_text,
                "has_prompt": f"v{version_num:02d} 纯生图提示词" in prompt_text,
            },
        ),
        CheckResult(
            name="record_doc_updated",
            passed=version_line_exists and record_prompt_exists,
            detail=f"修改记录已包含 v{version_num:02d} 版本条目与实际提示词留档",
            metrics={"has_version_row": version_line_exists, "has_prompt_section": record_prompt_exists},
        ),
        CheckResult(
            name="popup_container",
            passed=popup_found and 0.35 < popup_ratio < 0.95 and popup_center_offset < 0.08,
            detail="检测到居中的大弹窗容器，且不是全屏布局",
            metrics={"popup_found": popup_found, "popup_rect": popup, "popup_ratio": round(popup_ratio, 4), "center_offset_ratio": round(popup_center_offset, 4)},
        ),
        CheckResult(
            name="background_page_semantics",
            passed=dark_top_ratio > 0.42 and dark_left_ratio > 0.28,
            detail="图外背景存在深色顶部导航和左侧纵向菜单区域",
            metrics={"dark_top_ratio": round(dark_top_ratio, 4), "dark_left_ratio": round(dark_left_ratio, 4)},
        ),
        CheckResult(
            name="gray_workspace",
            passed=gray_ratio > 0.05,
            detail="画面中存在明显冷灰工作区背景",
            metrics={"gray_ratio": round(gray_ratio, 4)},
        ),
        CheckResult(
            name="module_order_markers",
            passed=len(markers) >= 3 and markers[0][1] < markers[1][1] < markers[2][1],
            detail="检测到三个纵向业务模块标题标记，且纵向顺序递增",
            metrics={"marker_count": len(markers), "markers": markers},
        ),
        CheckResult(
            name="pagination_exists",
            passed=pagination_found,
            detail="日志模块右下区域检测到分页器特征",
            metrics={"pagination_found": pagination_found},
        ),
        CheckResult(
            name="graph_region_exists",
            passed=graph_center_found,
            detail="弹窗下半区检测到关联图谱中心节点特征",
            metrics={"graph_center_found": graph_center_found},
        ),
    ]

    log_title = "登录日志" if version_num >= 9 else "登录活动日志"
    ocr_extension_targets = [
        "近7日存在异常风险",
        "优先查看：登录",
        "风险记录 / 全部记录",
        "登录 / 注册 / 支付",
        log_title,
        "关联分析",
    ]

    payload = {
        "image": str(image_path),
        "summary": {
            "passed": sum(1 for c in checks if c.passed),
            "failed": sum(1 for c in checks if not c.passed),
            "total": len(checks),
        },
        "checks": [asdict(check) for check in checks],
        "ocr_extension_targets": ocr_extension_targets,
        "residual_risk": "当前环境未接入 OCR，仅覆盖结构与资产自动验收；关键中文文案仍需人工补充确认。",
    }

    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_md.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# 设计图自动验收结果",
        "",
        f"- 图片：`{image_path.name}`",
        f"- 通过：{payload['summary']['passed']} / {payload['summary']['total']}",
        f"- 失败：{payload['summary']['failed']}",
        "",
        "| 检查项 | 结果 | 说明 |",
        "| --- | --- | --- |",
    ]
    for check in checks:
        lines.append(f"| {check.name} | {'PASS' if check.passed else 'FAIL'} | {check.detail} |")
    lines.extend(
        [
            "",
            "## OCR 扩展位",
            "",
            "以下文本项后续可接入 OCR 自动校验：",
            "",
        ]
    )
    for item in ocr_extension_targets:
        lines.append(f"- `{item}`")
    lines.extend(
        [
            "",
            "## 残余风险",
            "",
            payload["residual_risk"],
        ]
    )
    output_md.write_text("\n".join(lines), encoding="utf-8")

    print(json.dumps(payload["summary"], ensure_ascii=False))
    return 0 if payload["summary"]["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
