import React, { useRef, useState } from "react";
import { Rect } from "react-konva";

const Mark = ({ shapeProps, color, onChange, imageRef }) => {
  const shapeRef = useRef();
  const [lastRectPositionWithinImage, setLastRectPositionWithinImage] = useState({});

  const strokeWidth = 5;

  const onDrag = (e) => {
    const width = e.currentTarget.width();
    const height = e.currentTarget.height();
    const x = e.currentTarget.x();
    const y = e.currentTarget.y();

    const imageRect = imageRef.current.getClientRect();

    const rectangleWithinImage =
      (x >= imageRect.x) &&
      (y >= imageRect.y) &&
      ((x + width) <= (imageRect.x + imageRect.width)) &&
      ((y + height) <= (imageRect.y + imageRect.height));
    lastRectPositionWithinImage.x = x;
    lastRectPositionWithinImage.y = y;

    if (!rectangleWithinImage) {
      setLastRectPositionWithinImage({ x, y });
    }
  };


  return (
    <Rect
      ref={shapeRef}
      {...shapeProps}
      name="rectangle"
      draggable
      stroke={color + "15"}


      onMouseEnter={(e) => {
        const rect = e.target;
        rect.stroke(color + "15");
        rect.getStage().container().style.cursor = "move";
      }

      }
      onMouseLeave={(e) => {
        const rect = e.target;
        rect.stroke(color);
        rect.getStage().container().style.cursor = "default";
      }}


      onDragStart={onDrag}
      onDragMove={onDrag}
      onDragEnd={() => {
        onChange({
          ...shapeProps,
          x: lastRectPositionWithinImage.x,
          y: lastRectPositionWithinImage.y,
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

      strokeScaleEnabled={false}
      strokeWidth={strokeWidth}

    />
  );
};

export default Mark;
