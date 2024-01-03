import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Transformer, Image } from "react-konva";
import { useImageStage, isRectangle, isTransformer } from "./useImageStage.js";
import Mark from "./Mark";
import axios from "axios";
let k = 0;


import ContextMenu from "./ContextMenu.jsx";

const PhotoEditor = ({ image, imageDimensions, initialColor: editorInitialColor, rectangles, onRectanglesChange, photoId, unselectAll, setUnselectAll, firstPosition, setFirstPosition }) => {
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



    // const [listOfColors, setListOfColors] = useState([]);

    // axios.post('http://localhost:5002/colors/re', {

    // useEffect(() => {
    //   axios.get('http://localhost:5002/colors/findAll')
    //     .then((response) => {
    //       setListOfColors(response.data);
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //     });
    // }, []);


    const listOfColors = JSON.parse(localStorage.getItem('rectangles'));

    const initialX = ((window.innerWidth *0.82)/2  - imageDimensions.width / 2);
    const initialY = (window.innerHeight / 2 - imageDimensions.height / 2);

    // if the image dimensions are bigger scale the image down

    const [drawing, setDrawing] = useState(false);
    const [rectangleDrawn, setRectangleDrawn] = useState(false);

    useEffect(() => {
        if (unselectAll) {
            setUnselectAll(false);
            // trRef.current.nodes([]);
            selectShapes([]);
            // also set the stage scale to 1
            const stage = stageRef.current;
            stage.scaleX(1);
            stage.scaleY(1);
            // also set the stage position to 0
            stage.x(0);
            stage.y(0);
            // also set the stage rotation to 0
            stage.rotation(0);
        }
    }, [unselectAll, setUnselectAll]);

    useEffect(() => {
        if (firstPosition) {
            setFirstPosition(false);
            selectShapes([]);
            
        }
    }, [firstPosition, setFirstPosition]);





    useEffect(() => {
        const handleMouseDown = (event) => {
            if (isRectangle(event) || isTransformer(event) || event.evt.button === 1 || event.evt.button === 2) return;

            const { x, y } = event.target.getStage().getPointerPosition();
            const stage = stageRef.current;
            const stageScaleX = stage.scaleX();
            const stageScaleY = stage.scaleY();


            if (drawing) return;

            setRectangles((prevRectangles) => [
                ...prevRectangles,
                {
                    x: (x - stage.x()) / stageScaleX,
                    y: (y - stage.y()) / stageScaleY,
                    width: 0,
                    height: 0,
                    key: Date.now().toString(),
                    id: Date.now().toString(),
                    fill: editorInitialColor,
                    stroke: editorInitialColor,
                    opacity: 0.5,
                    photoId: photoId,
                },
            ]);

            setDrawing(true);
            setRectangleDrawn(true);
        };

        const handleMouseMove = (event) => {
            if (drawing) {
                const { x, y } = event.target.getStage().getPointerPosition();
                const stage = stageRef.current;
                const stageScaleX = stage.scaleX();
                const stageScaleY = stage.scaleY();

                // if (isRectangle(event) || isTransformer(event)) return;

                setRectangles((prevRectangles) => {
                    const currentRect = prevRectangles[prevRectangles.slice().length - 1];
                    currentRect.width = (x - stage.x()) / stageScaleX - currentRect.x;

                    currentRect.height = (y - stage.y()) / stageScaleY - currentRect.y;
                    return [...prevRectangles.slice(0, prevRectangles.length - 1), currentRect];
                });
            }
        };

        const handleMouseUp = (event) => {
            setDrawing(false);
            if ((isRectangle(event) || isTransformer(event)) && !drawing) return;


            if (rectangleDrawn) {
                setRectangles((prevRectangles) => {
                    if (prevRectangles[prevRectangles.length - 1].x === prevRectangles[prevRectangles.length - 2]?.x && prevRectangles[prevRectangles.length - 1].y === prevRectangles[prevRectangles.length - 2]?.y) {
                        return prevRectangles.slice(0, prevRectangles.length - 1);
                    }
                    return prevRectangles.slice(0, prevRectangles.length - 1);
                });


                if (rectanglesToDraw[rectanglesToDraw.length - 1].width === 0 && rectanglesToDraw[rectanglesToDraw.length - 1].height === 0) {
                    selectShapes([]);
                    // setRectangles((prevRectangles) => {
                    //     return prevRectangles.slice(0, prevRectangles.length - 1);
                    // });
                    return;
                }

                if (rectanglesToDraw[rectanglesToDraw.length - 1].width !== 0 && rectanglesToDraw[rectanglesToDraw.length - 1].height !== 0) {
                    selectShapes([rectanglesToDraw[rectanglesToDraw.length - 1].id]);
                }
            }
            // if there is more than one color, open context menu
            if (JSON.parse(localStorage.getItem('rectangles')).length > 1 && rectangleDrawn) {
                handleContextMenu(event);
            }
            setRectangleDrawn(false);
        };

        const stage = stageRef.current;


        if (!areRectanglesEqual(rectanglesToDraw, rectangles)) {
            setRectangles(rectanglesToDraw);
            onRectanglesChange(image.name, rectanglesToDraw);
        }
        localStorage.setItem(photoId, JSON.stringify(rectanglesToDraw));
        // axios(
        //     {
        //         method: 'post',
        //         url: `${process.env.URL}/mark/create`,
        //         //const {x, y, width, height, settings_id, photo_id}
        //         data: {
        //             x: rectanglesToDraw.map((rect) => rect.x),
        //             y: rectanglesToDraw.map((rect) => rect.y),
        //             width: rectanglesToDraw.map((rect) => rect.width),

        //             height: rectanglesToDraw.map((rect) => rect.height),
        //             settings_id: 1,
        //             photo_id: rectanglesToDraw.map((rect) => rect.photoId),
        //         }
        //     }
        // );

        const handleContextMenu = (e) => {
            e.evt.preventDefault();

            const pointerPos = stage.getPointerPosition();

            contextMenuPosition.x = pointerPos.x + 320;
            contextMenuPosition.y = pointerPos.y - 35;

            setContextMenuOpen(true);
        };



        stage.on("contextmenu", handleContextMenu);
        stage.on("mousedown", handleMouseDown);
        stage.on("mousemove", handleMouseMove);
        stage.on("mouseup", handleMouseUp);

        return () => {
            stage.off("mousedown", handleMouseDown);
            stage.off("mousemove", handleMouseMove);
            stage.off("mouseup", handleMouseUp);
            stage.off("contextmenu", handleContextMenu);
        };


    }, [drawing, setRectangles, editorInitialColor, photoId, rectanglesToDraw, rectangles, onRectanglesChange]);



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



    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [isContextMenuOpen, setContextMenuOpen] = useState(false);
    const handleContextMenu = (e) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        const pointerPos = stage.getPointerPosition();


        setContextMenuOpen(true);
    };

    const handleCloseContextMenu = (color) => {
        setContextMenuOpen(false);
        // set initialColor to color
        // set fill and stroke of selected rectangles to color
        // set fill and stroke of selected rectangles to initialColor


        if (color) {
            setRectangles((prevRectangles) => {
                const updatedRectangles = prevRectangles.map((rect) => {
                    if (selectedIds.includes(rect.id)) {
                        rect.fill = color;
                        rect.stroke = color;
                    }
                    return rect;
                });
                localStorage.setItem(photoId, JSON.stringify(updatedRectangles));
                // axios(
                //     {
                //         method: 'post',
                //         url: `${process.env.URL}/mark`,
                //         data: {
                //             rectangles: updatedRectangles,
                //             photoId: photoId,
                //         }
                //     }
                // )
                return updatedRectangles;
            });
        }
    };

    const handleDeleteContextMenu = () => {
        setRectangles((prevRectangles) => {
            const updatedRectangles = prevRectangles.filter(
                (rect) => !selectedIds.includes(rect.id)
            );
            selectShapes([]);
            localStorage.setItem(photoId, JSON.stringify(updatedRectangles));
            // axios(  
            //     {
            //         method: 'post',
            //         url: `${process.env.URL}/mark`,
            //         data: {
            //             rectangles: updatedRectangles,
            //             photoId: photoId,
            //         }
            //     }
            // )
            return updatedRectangles;
        });

        handleCloseContextMenu();
    };

    const handleColorChange = (color) => {
        setRectangles((prevRectangles) => {
            const updatedRectangles = prevRectangles.map((rect) => {
                if (selectedIds.includes(rect.id)) {
                    rect.fill = color;
                    rect.stroke = color;
                }
                return rect;
            });
            localStorage.setItem(photoId, JSON.stringify(updatedRectangles));
            // axios(
            //     {
            //         method: 'post',
            //         url: `${process.env.URL}/mark`,
            //         data: {
            //             rectangles: updatedRectangles,
            //             photoId: photoId,
            //         }
            //     }
            // )

            return updatedRectangles;
        });
    }







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

                        {rectanglesToDraw.filter((rect) => rect.photoId === photoId).map((rect, i) => (
                            <Mark
                                imageRef={imageRef}
                                key={i}
                                shapeProps={rect}
                                color={rect.fill}
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
                        <Rect fill={editorInitialColor} ref={selectionRectRef} />
                    </Layer>
                </Stage>
            </div>
            <ContextMenu
                position={contextMenuPosition}
                onClose={handleCloseContextMenu}
                onDelete={handleDeleteContextMenu}
                isOpen={isContextMenuOpen}
                listOfColors={listOfColors}
            />
        </>
    );
};

export default PhotoEditor;
