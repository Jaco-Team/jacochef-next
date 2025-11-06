"use client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from "prop-types";
import { useMemo } from "react";

export default function DraggableImage({ image, rotate = 0, scaleX = 1, scaleY = 1 }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: "bill-image",
  });

  const style = useMemo(() => {
    const dragTransform = transform ? CSS.Translate.toString(transform) : "";
    return {
      transform: `
        ${dragTransform}
        rotate(${rotate}deg)
        scale(${scaleX}, ${scaleY})
      `,
      cursor: isDragging ? "grabbing" : "grab",
      transition: isDragging ? "none" : "transform 0.1s ease",
      willChange: "transform",
    };
  }, [transform, rotate, scaleX, scaleY, isDragging]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <img
        src={image}
        alt="Bill image"
        className="image_bill"
        draggable={false}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

DraggableImage.propTypes = {
  image: PropTypes.string.isRequired,
  rotate: PropTypes.number,
  scaleX: PropTypes.number,
  scaleY: PropTypes.number,
};
