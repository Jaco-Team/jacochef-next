"use client";
import { useDraggable } from "@dnd-kit/core";
import PropTypes from "prop-types";
import { useMemo } from "react";

export default function DraggableImage({
  image,
  rotate = 0,
  scaleX = 1,
  scaleY = 1,
  x = 0,
  y = 0,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: "bill-image",
  });

  const dragX = (transform?.x ?? 0) + x;
  const dragY = (transform?.y ?? 0) + y;

  const dragStyle = useMemo(
    () => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translate(calc(-50% + ${dragX}px), calc(-50% + ${dragY}px))`,
      cursor: isDragging ? "grabbing" : "grab",
      transition: isDragging ? "none" : "transform 0.1s ease",
      willChange: "transform",
      zIndex: 1001,
    }),
    [dragX, dragY, isDragging],
  );

  const visualStyle = useMemo(
    () => ({
      transform: `rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: "center center",
      transition: "transform 0.1s ease",
    }),
    [rotate, scaleX, scaleY],
  );

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
    >
      <div style={visualStyle}>
        <img
          src={image}
          alt="Bill image"
          className="image_bill"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

DraggableImage.propTypes = {
  image: PropTypes.string.isRequired,
  rotate: PropTypes.number,
  scaleX: PropTypes.number,
  scaleY: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
};
