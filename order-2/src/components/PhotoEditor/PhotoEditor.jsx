import React, { useState,useEffect } from "react";
import { Stage, Layer, Rect, Transformer, Image } from "react-konva";
import { useImageStage } from "./useImageStage.js";
import Mark from "./Mark";

import ContextMenu from "./ContextMenu.jsx";
let k=0;

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
        selectedIds,
        stageRef,
        selectShapes,
    } = useImageStage(rectangles, editorInitialColor, photoId);


    const initialX = (window.innerWidth * 0.82 - imageDimensions.width) / 2;
    const initialY = (window.innerHeight - imageDimensions.height) / 2;


    useEffect(() => {
        console.log("rectanglesAreEqual: " + areRectanglesEqual(rectanglesToDraw, rectangles));
        console.log("rectanglesToDraw: " + rectanglesToDraw.length + " " + k++);
        console.log("image dimensions: " + imageDimensions.width + " " + imageDimensions.height);
        if (!areRectanglesEqual(rectanglesToDraw, rectangles)) {
            setRectangles(rectanglesToDraw);
            onRectanglesChange(image.name, rectanglesToDraw);
        }
        localStorage.setItem(photoId, JSON.stringify(rectanglesToDraw));
    
        const stage = stageRef.current;
    
        const handleContextMenu = (e) => {
            e.evt.preventDefault();
    
            const pointerPos = stage.getPointerPosition();
            console.log("pointerPos: " + pointerPos.x + " " + pointerPos.y);
    
            contextMenuPosition.x = pointerPos.x + 320;
            contextMenuPosition.y = pointerPos.y - 35;
    
            console.log("contextMenuPosition: " + contextMenuPosition.x + " " + contextMenuPosition.y);
    
            setContextMenuOpen(true);
        };
    
        stage.on("contextmenu", handleContextMenu);
    
        return () => {
            stage.off("contextmenu", handleContextMenu);
        };
    
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



    const [contextMenuPosition, setContextMenuPosition] = useState({ x:0, y: 0 });
    const [isContextMenuOpen, setContextMenuOpen] = useState(false);

    const handleContextMenu = (e) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        const pointerPos = stage.getPointerPosition();
        console.log("pointerPos: " + pointerPos.x + " " + pointerPos.y);


        console.log("contextMenuPosition: " + contextMenuPosition.x + " " + contextMenuPosition.y);

        setContextMenuOpen(true);
    };

    const handleCloseContextMenu = () => {
        setContextMenuOpen(false);
    };

    const handleDeleteContextMenu = () => {
        // Delete the selected rectangles
        setRectangles((prevRectangles) => {
            const updatedRectangles = prevRectangles.filter(
                (rect) => !selectedIds.includes(rect.id)
            );
            selectShapes([]);
            localStorage.setItem(photoId, JSON.stringify(updatedRectangles));
            return updatedRectangles;
        });

        handleCloseContextMenu();
    };

    return (
        <>
            <div>
                <Stage
                    {...stageProps}
                    width={imageDimensions.width}
                    height={imageDimensions.height}
                >
                    <Layer ref={layerRef}>
                        <Image
                            {...imageDimensions}
                            ref={imageRef}
                            image={image}
                            x={initialX}
                            y={initialY}
                        />

                        {rectanglesToDraw.filter((rect) => rect.photoId === photoId).map((rect, i) => (
                            <Mark
                                imageRef={imageRef}
                                key={i}
                                shapeProps={rect}
                                color = {initialColor}
                                onChange={(newAttrs) => {
                                    const rects = rectanglesToDraw.slice();
                                    rects[i].x = newAttrs.x;
                                    rects[i].y = newAttrs.y; 
                                    setRectangles(rects);
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
            <ContextMenu
                position={contextMenuPosition}
                onClose={handleCloseContextMenu}
                onDelete={handleDeleteContextMenu}
                isOpen={isContextMenuOpen}
            />
            </>
    );
};

export default PhotoEditor;
