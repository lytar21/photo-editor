import { useEffect, useRef, useState } from "react";

export function useImageStage(initialRectangles, editorInitialColor, photoId) {
    const [stage, setStage] = useState({
        scale: 1,
        x: 0,
        y: 0,
    });
    const [selectedIds, selectShapes] = useState([]);
    const [newRectangle, setNewRectangle] = useState([]);
    const [contextMenuOpen, setContextMenuOpen] = useState(false);

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.evt.preventDefault();

            if (selectedIds.length > 0) {
                setContextMenuOpen(true);
            }
        };

        const stage = stageRef.current;
        stage.on("contextmenu", handleContextMenu);

        return () => {
            stage.off("contextmenu", handleContextMenu);
        };
    }, [selectedIds]);


    const [rectangles, setRectangles] = useState(initialRectangles || []);

    
    const rectanglesToDraw = rectangles.length>0? rectangles.filter((rect) => rect.photoId === photoId) : [];
    const trRef = useRef();
    const selectionRectRef = useRef();
    const selection = useRef({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });
    const layerRef = useRef();
    const stageRef = useRef();
    const imageRef = useRef();

    const [imageUrl, setImageUrl] = useState("https://source.unsplash.com/random/300x300?sky");




    const isWithinImageBounds = (x, y) => {
        const imageRect = imageRef.current.getClientRect();
        return (
            (x >= imageRect.x) &&
            (x <= (imageRect.x + imageRect.width)) &&
            (y >= imageRect.y )&&
            (y <= (imageRect.y + imageRect.height))
        );
    };
    
    const calculateRelativePosition = (coordinate, scale) => coordinate / scale;
    const calculateRelativeSize = (size, scale) => size / scale;
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.keyCode === 46 && selectedIds.length > 0) {
                // DEL key is pressed
                // Delete selected rectangles
                setRectangles((prevRectangles) => {
                    const updatedRectangles = prevRectangles.filter(
                        (rect) => !selectedIds.includes(rect.id)
                    );
                    selectShapes([]);
                    return updatedRectangles;
                });
            }
            // if ALT key is pressed then copy the selected rectangles
            if (e.key === "Alt") {
                console.log("ALT key is pressed");
                // Create new rectangles as copies of the selected ones
                setRectangles((prevRectangles) => {
                    const selectedRectangles = prevRectangles.filter((rect) =>
                        selectedIds.includes(rect.id)
                    );
    
                    const updatedRectangles = [
                        ...prevRectangles,
                        ...selectedRectangles.map((selectedRect) => ({
                            ...selectedRect,
                            id: Date.now().toString(), // Generate new id for the copied rectangle
                            key: Date.now().toString(),
                            x: selectedRect.x + 100,
                            y: selectedRect.y + 100,
                        })),
                    ];
    
                    return updatedRectangles;
                });
            }
        };
    
        const stage = stageRef.current;
        document.addEventListener("keydown", handleKeyDown);
    
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedIds]);


    const handleMouseDown = (event) => {
        if (isRectangle(event) || isTransformer(event)) return;

        const { x, y } = event.target.getStage().getPointerPosition();

        if (isWithinImageBounds(x, y)) {


            setNewRectangle([
                {
                    x: calculateRelativePosition(x - stage.x, stage.scale),
                    y: calculateRelativePosition(y - stage.y, stage.scale),
                    width: 1 / stage.scale,
                    height: 1 / stage.scale,
                    key: Date.now().toString(),
                    id: Date.now().toString(),
                    fill: editorInitialColor,
                    stroke: editorInitialColor,
                    opacity: 0.5,
                    photoId: photoId,
                },
            ]);
        }
    };

    const handleMouseMove = (event) => {
        if (newRectangle.length === 1) {
            const { x, y } = event.target.getStage().getPointerPosition();
            const updatedRect = { ...newRectangle[0] };

            updatedRect.width = calculateRelativeSize(x - stage.x, stage.scale) - updatedRect.x;
            updatedRect.height = calculateRelativeSize(y - stage.y, stage.scale) - updatedRect.y;
            
            setNewRectangle([updatedRect]);
        }
    };

    const handleMouseUp = () => {
        if (newRectangle.length === 1) {
            setRectangles((prevRectangles) => {
                prevRectangles = prevRectangles.length > 0 ? prevRectangles : [];
                const updatedRectangles = [...prevRectangles, newRectangle[0]];
                return updatedRectangles;
            });

            setNewRectangle([]);
        }
    };


    const handleWheel = (e) => {
        e.evt.preventDefault();
      
        const scaleBy = 1.1;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
          x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
          y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      
        setStage((prevStage) => ({
          ...prevStage,
          scale: newScale,
          x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
          y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale,
        }));
      };


    const handleWidth = (e) => {
        return e.target.getClientRect().width;
    };

    const handleHeight = (e) => {
        return e.target.getClientRect().height;
    };


    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShapes([]);
        }
    };

    const onClickTap = (e) => {
        const { x1, x2, y1, y2 } = selection.current;
        const moved = ((x1 !== x2) || (y1 !== y2));
        if (moved) {
            return;
        }
        let stage = e.target.getStage();
        let layer = layerRef.current;
        let tr = trRef.current;

        if (e.target === stage) {
            selectShapes([]);
            return;
        }

        if (!e.target.hasName("rectangle")) {
            return;
        }

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = tr.nodes().indexOf(e.target) >= 0;

        if (!metaPressed && !isSelected) {
            selectShapes([e.target.id()]);
        } else if (metaPressed && isSelected) {
            selectShapes((oldShapes) => {
                return oldShapes.filter((oldId) => oldId !== e.target.id());
            });
        } else if (metaPressed && !isSelected) {
            selectShapes((oldShapes) => {
                return [...oldShapes, e.target.id()];
            });
        }
        layer.draw();
    };


    useEffect(() => {
        const nodes = selectedIds.map((id) => layerRef.current.findOne("#" + id));
        trRef.current.nodes(nodes);
    }, [selectedIds]);

    const handleChangeImage = (newImageUrl) => {
        setImageUrl(newImageUrl);
    };

    return {
        rectangles: rectangles[photoId] || [],
        imageUrl,
        handleChangeImage,
        rectanglesToDraw,
        layerRef,
        trRef,
        selectionRectRef,
        setRectangles: (newRectangles) => {
            setRectangles(newRectangles);
        
        },
        imageRef,
        stageProps: {
            ref: stageRef,
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onTouchStart: checkDeselect,
            onClick: onClickTap,
            onWheel: handleWheel,
            scaleX: stage.scale,
            scaleY: stage.scale,
            x: stage.x,
            y: stage.y,
        },
        selectedIds,
        stageRef,
        contextMenuOpen,
        selectShapes,
    };
}

export const isRectangle = (e) => {
    return e.target.hasName("rectangle");
};
export const isTransformer = (e) => {
    return e.target.findAncestor("Transformer");
};


