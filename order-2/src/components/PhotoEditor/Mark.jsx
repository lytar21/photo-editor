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
      // color of rectangle
      fill={color}
      stroke={color}
      strokeWidth={0}
      


      onMouseEnter={(e) => {
        const rect = e.target;
        // make rectangle darker on hover
        rect.fill(color + "99");
        // console.log("rect.fill(color + 20):", rect.fill(color + "80"));        
        rect.getStage().container().style.cursor = "grab";
      }

      }
      onMouseLeave={(e) => {
        const rect = e.target;
        // return rectangle to original color
        rect.fill(color);
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
        const width_ = Math.max(5, node.width() * scaleX);
        const height_ = Math.max(node.height() * scaleY);
        console.log("width_:", width_, "height_:", height_);
        console.log("node.width():", node.width()*scaleX, "node.height():", node.height()*scaleY);

        onChange({
          ...shapeProps,
          x: node.x(),
          y: node.y(),
          width: width_,
          height: height_,
        });
      }}
      fillAfterStrokeEnabled={false}


      

    />
  );
};

export default Mark;
