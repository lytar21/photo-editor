import React, { useState, useEffect } from 'react';
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import useImage from "use-image";
import PhotoEditor from "./components/PhotoEditor/PhotoEditor";
import { Box, TextField, Select, MenuItem } from "@mui/material";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';

import SettingsModal from './components/PhotoEditor/SettingsModal.jsx';



const App = () => {
    const [images, setImages] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("https://source.unsplash.com/random/300x300?sky");
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [image] = useImage(imageUrl);
    const [initialColor, setInitialColor] = useState("#ff0000");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [imageRectangles, setImageRectangles] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageRectangles, setSelectedImageRectangles] = useState(imageRectangles[selectedImage] || []);
    const [rectangles, setRectangles] = useState([]);
    const [rectanglesToDraw, setRectanglesToDraw] = useState([]);
    const [photoId, setPhotoId] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [unselectAll, setUnselectAll] = useState(false);
    const [firstPosition, setFirstPosition] = useState(false);

    useEffect(() => {
        const results = images.filter((image) => {
            const res = image.fileName.toLowerCase().includes(searchText.toLowerCase());
            if (selectedFilter === "all") {
                return res;
            } else if (selectedFilter === "withoutAnnotations") {
                return res && localStorage.getItem(image.url) === null || localStorage.getItem(image.url) === "[]";
                // return res && axios.get(`${process.env.URL}/mark/findById${image.url}`).then(res => {
                //     return res.data.length === 0;
                // }
                // );
            } else if (selectedFilter === "withAnnotations") {
                return res && localStorage.getItem(image.url) !== null && localStorage.getItem(image.url) !== "[]";
            }
        }
        );
        setSearchResults(results.filter((image) => image.width !== 0 && image.height !== 0));
    }, [searchText, images, selectedFilter]);

    const handleOpen = () => {
        if (!imageFile) {
            setSettingsOpen((prev) => !prev);
        }
    };

    const handleSettingsOpen = () => {
        setSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    const handleColorChange = (color) => {
        setInitialColor(color);
    };

    const handleChangeImage = (e) => {

        setRectangles([]);
        setSelectedImageRectangles([]);
        const file = e.target.files[0];
        setImageFile(file);

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;

                img.onload = () => {
                    let width, height;
                    const imageWidth = img.width;
                    const imageHeight = img.height;

                    const stageHeight = window.innerHeight;
                    const stageWidth = window.innerWidth  * 0.82;

                    const imageRatio = imageWidth / imageHeight;
                    const stageRatio = stageWidth / stageHeight;

                    // if the image width is larger than the height, scale the image to fit the width of the stage
                    if (imageRatio > stageRatio) {
                        width = stageWidth;
                        height = width / imageRatio;
                    }
                    // otherwise, scale it to fit the height
                    else {
                        height = stageHeight;
                        width = height * imageRatio;
                    }


                    const newImage = {
                        url: URL.createObjectURL(file),
                        dimensions: { width, height },
                        fileName: file.name,
                    };

                    setImages((prevImages) => [...prevImages, newImage]);
                    handleRectanglesInitialization(newImage.url);
                };
            };

            reader.readAsDataURL(file);
        }
    };

    const handleRectanglesChange = (photoId, newRectangles) => {
        setImageRectangles((prevImageRectangles) => {
            const updatedRectangles = {
                ...prevImageRectangles,
                [photoId]: newRectangles,
            };

            const allRectangles = Object.values(updatedRectangles).flat();
            setRectanglesToDraw(allRectangles);

            return updatedRectangles;
        });
    };

    const handleRectanglesInitialization = (newImageUrl) => {
        const initialRectangles = loadRectanglesFromLocalStorage(newImageUrl);
        setImageRectangles((prevImageRectangles) => ({
            ...prevImageRectangles,
            [newImageUrl]: initialRectangles,
        }));
        // setSelectedImageRectangles(initialRectangles);
        setRectanglesToDraw(initialRectangles);
    };


    useEffect(() => {
        const storedRectangles = loadRectanglesFromLocalStorage(selectedImage);
        // setSelectedImageRectangles(storedRectangles);
        setRectanglesToDraw(storedRectangles);
        setRectangles(storedRectangles);

    }, [selectedImage]);


    const loadRectanglesFromLocalStorage = (imageUrl) => {
        const storedRectangles = JSON.parse(localStorage.getItem(imageUrl)) || {};
        const localStorageContent = JSON.stringify(storedRectangles);
        return storedRectangles[imageUrl] || [];
    };

    const handleImageChange = (newImageUrl, storedRects) => {
        setUnselectAll(true);
        setFirstPosition(true);
        setPhotoId(newImageUrl);
        setSelectedImage(newImageUrl);
        setImageUrl(newImageUrl);
        setSelectedImageRectangles(storedRects);
    };

    const handleImageChangeDimensions = (imageFile) => {
        setImageDimensions(imageFile.dimensions);
    }




    const handleExport = () => {
        const jsonData = JSON.stringify(imageRectangles);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'labels.json';
        link.click();
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <Box sx={{ width: '18%', height: '100%', background: 'gray' }}>
                <Button sx={{ marginTop: '10px', marginLeft: '5px' }}
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleOpen}>

                    Upload file

                    <VisuallyHiddenInput onChange={handleChangeImage} type="file" />

                </Button>

                <Button sx={{
                    marginTop: '-36px',
                    marginLeft: '154px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }} variant="contained" onClick={handleSettingsOpen}  >
                    <SettingsIcon />
                </Button>

                <TextField
                    sx={{
                        marginTop: '20px',
                        marginLeft: '20px',
                        width: '80%',
                        color: 'white',
                        '& .MuiInputBase-root': {
                            backgroundColor: 'white',
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'blue',
                            },
                            '&:hover fieldset': {
                                borderColor: 'blue',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'blue',
                            },
                        },
                    }}
                    label="Search"
                    variant="outlined"
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                    sx={{
                        marginTop: '20px',
                        marginLeft: '20px',
                        width: '80%',
                        color: 'white',
                        '& .MuiInputBase-root': {
                            backgroundColor: 'white',
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'gray',
                            },
                            '&:hover fieldset': {
                                borderColor: 'blue',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'blue',
                            },
                        },
                    }}
                    label="Filter"
                    variant="outlined"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}

                >
                    <MenuItem value="all">всі файли</MenuItem>
                    <MenuItem value="withoutAnnotations">файли без анотацій</MenuItem>
                    <MenuItem value="withAnnotations">файли з анотаціями</MenuItem>
                </Select>


                <Box sx={{ height: '65%', overflowY: 'auto', marginTop: '20px', marginLeft: '30px' }}>
                    {

                        searchResults.map((uploadedImage, index) => (
                            <Button
                                key={index}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: '10px',
                                    marginLeft: '45px',
                                    width: '100px',
                                    height: '100px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    },
                                    '&:active': {
                                        backgroundColor: 'rgba(223, 240, 255, 0.8) !important',
                                    },
                                }}
                                variant="contained"
                                onClick={() => {
                                    // remove all selected rectangles
                                    const storedRectangles = localStorage.getItem(uploadedImage.url) || [];
                                    handleImageChange(uploadedImage.url, storedRectangles);
                                    handleImageChangeDimensions(uploadedImage);
                                }}
                            >
                                <img
                                    src={uploadedImage.url}
                                    alt={uploadedImage.fileName}
                                    style={{ width: '100%', height: '80%', objectFit: 'cover' }}
                                />

                                <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                                    {uploadedImage.fileName}
                                </div>

                            </Button>
                        ))}
                    <Box sx={{
                        position: 'fixed',
                        bottom: '20px',
                        marginLeft: '55px',
                        color: 'black',
                        fontSize: '20px',
                        fontWeight: '600'
                    }}>
                        Total : {images.length}
                    </Box>

                    <Button
                        sx={{ position: 'fixed', bottom: '55px', marginLeft: '35px' }}
                        variant="contained"
                        onClick={handleExport}
                        startIcon={<SaveAltIcon />}
                    >
                        Export
                    </Button>

                </Box>
            </Box>


            {selectedImage && (
                <PhotoEditor
                    imageDimensions={imageDimensions}
                    handleImageChangeDimensions={handleImageChangeDimensions}
                    image={image}
                    initialColor={initialColor}
                    rectangles={imageRectangles[selectedImage] || []}
                    onRectanglesChange={handleRectanglesChange}
                    photoId={selectedImage}
                    unselectAll={unselectAll}
                    setUnselectAll={setUnselectAll}
                    firstPosition={firstPosition}
                    setFirstPosition={setFirstPosition}
                    windowWidth={window.innerWidth}
                    windowHeight={window.innerHeight}
                />
            )}
            <SettingsModal
                open={settingsOpen}
                onClose={handleSettingsClose}
                onColorChange={handleColorChange}
            />

        </Box>
    );
};

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default App;