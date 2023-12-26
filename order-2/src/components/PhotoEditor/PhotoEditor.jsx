import React, { useEffect } from "react";
import { Stage, Layer, Rect, Transformer, Image } from "react-konva";
import { useImageStage } from "./useImageStage.js";
import Mark from "./Mark";

const PhotoEditor = ({ image, imageDimensions, initialColor: editorInitialColor, rectangles, onRectanglesChange, photoId, onRectanglesExistenceChange }) => {
    const {
        rectanglesToDraw,
        initialColor,
        layerRef,
        trRef,
        selectionRectRef,
        imageRef,
        stageProps,
        setRectangles,
    } = useImageStage(rectangles, editorInitialColor, photoId,);

    const initialX = (window.innerWidth * 0.82 - imageDimensions.width) / 2;
    const initialY = (window.innerHeight - imageDimensions.height) / 2;

    useEffect(() => {
        if (!areRectanglesEqual(rectanglesToDraw, rectangles)) {
            setRectangles(rectanglesToDraw);
            onRectanglesChange(photoId, rectanglesToDraw);
            
        }
    }, [rectanglesToDraw, photoId, rectangles, setRectangles, onRectanglesChange]);

    const areRectanglesEqual = (rectanglesArray1, rectanglesArray2) => {
        const areIndividualRectanglesEqual = (rect1, rect2) => {
            return JSON.stringify(rect1) === JSON.stringify(rect2);
        };
    
        const photoId = rectanglesArray1[0]?.photoId; 
        const rectangles1 = rectangles[photoId] || [];
        const rectangles2 = rectanglesArray2 || [];
    
        if (rectangles1.length !== rectangles2.length) {
            return false;
        }
    
        for (let i = 0; i < rectangles1.length; i++) {
            if (!areIndividualRectanglesEqual(rectangles1[i], rectangles2[i])) {
                return false;
            }
        }
    
        return true;
    };

    return (
        <>
            <div>
                <Stage
                    {...stageProps}
                    width={window.innerWidth * 0.82}
                    height={window.innerHeight}
                >
                    <Layer ref={layerRef}>
                        <Image
                            {...imageDimensions}
                            ref={imageRef}
                            image={image}
                            x={initialX}
                            y={initialY}
                        />

                        {rectanglesToDraw.map((rect, i) => (
                            <Mark
                                imageRef={imageRef}
                                key={i}
                                shapeProps={rect}
                                color = {initialColor}
                                onChange={(newAttrs) => {
                                    const rects = rectanglesToDraw.slice();
                                    rects[i] = newAttrs;
                                    onRectanglesChange(photoId, rects);
                                }}
                            />
                        ))}

                        <Transformer
                            ref={trRef}
                            rotateEnabled={false}
                            anchorSize={10}
                            borderEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 5 || newBox.height < 5) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                        />
                        <Rect fill={initialColor} ref={selectionRectRef} />
                    </Layer>
                </Stage>
            </div>
        </>
    );
};

export default PhotoEditor;
