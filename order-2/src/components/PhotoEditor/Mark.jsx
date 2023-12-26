import React, { useRef, useState } from "react";
import { Rect } from "react-konva";

const Mark = ({ shapeProps, color, onChange, imageRef }) => {
  const shapeRef = useRef();
  const [lastRectPositionWithinImage, setLastRectPositionWithinImage] = useState({});

  const onDrag = (e) => {
    const width = e.currentTarget.width();
    const height = e.currentTarget.height();
    const x = e.currentTarget.x();
    const y = e.currentTarget.y();
    console.log("x: " + x + " y: " + y + " width: " + width + " height: " + height);

    const imageRect = imageRef.current.getClientRect();

    const rectangleWithinImage =
      x >= imageRect.x &&
      y >= imageRect.y &&
      x + width <= imageRect.x + imageRect.width &&
      y + height <= imageRect.y + imageRect.height;

    if (rectangleWithinImage) {
      setLastRectPositionWithinImage({ x, y });
    }
  };
  

  return (
    <Rect
      ref={shapeRef}
      {...shapeProps}
      name="rectangle"
      draggable
      stroke={color}
      strokeWidth={10}
      onDragStart={onDrag}
      onDragMove={onDrag}
      onDragEnd={() => {
        onChange({
          ...shapeProps,
          ...lastRectPositionWithinImage,
        });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const width = Math.max(5, node.width() * scaleX);
        const height = Math.max(5, node.height() * scaleY);

        onChange({
          ...shapeProps,
          x: node.x(),
          y: node.y(),
          width: width,
          height: height,
        });
      }}
    />
  );
};

export default Mark;
