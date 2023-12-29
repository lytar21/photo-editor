import React, { useState, useEffect } from 'react';
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import useImage from "use-image";
import PhotoEditor from "./components/PhotoEditor/PhotoEditor";
import { Box, TextField, Select, MenuItem } from "@mui/material";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SettingsIcon from '@mui/icons-material/Settings';

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


    useEffect(() => {
        const results = images.filter((image) => {
            return image.fileName.toLowerCase().includes(searchText.toLowerCase());
        });
    
        setSearchResults(results);
    }, [searchText, images, imageRectangles]);



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
                    const stageWidth = window.innerWidth * 0.82;

                    if (imageWidth >= imageHeight) {
                        width = stageWidth;
                        height = (imageHeight * width) / imageWidth;
                    } else {
                        height = stageHeight;
                        width = (imageWidth * height) / imageHeight;
                    }

                    const newImage = {
                        url: URL.createObjectURL(file),
                        dimensions: { width, height },
                        fileName: file.name,
                    };

                    setImages((prevImages) => [...prevImages, newImage]);
                    setImageDimensions({ width, height });
                    handleRectanglesInitialization(newImage.url);
                };
            };

            reader.readAsDataURL(file);
        }
    };

    const handleRectanglesChange = (photoId, newRectangles) => {
        setImageRectangles((prevImageRectangles) => {
            console.log("prev "+ prevImageRectangles.length);

            const updatedRectangles = {
                ...prevImageRectangles,
                [photoId]: newRectangles,
            };
            console.log("updated " + updatedRectangles.length);

            const allRectangles = Object.values(updatedRectangles).flat();
            console.log("all " + allRectangles.filter((rect) => rect.photoId === photoId).length);
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
        setSelectedImageRectangles(initialRectangles);
        setRectanglesToDraw(initialRectangles);
    };

    
    useEffect(() => {
        const storedRectangles = loadRectanglesFromLocalStorage(selectedImage);
        setSelectedImageRectangles(storedRectangles);
        setRectanglesToDraw(storedRectangles);
        setRectangles(storedRectangles);

    }, [selectedImage]);


    const loadRectanglesFromLocalStorage = (imageUrl) => {
        const storedRectangles = JSON.parse(localStorage.getItem("rectangles")) || {};
        const localStorageContent = JSON.stringify(storedRectangles);
        console.log(storedRectangles.length+"storedRectangles");
        return storedRectangles[imageUrl] || [];
    };

    const handleImageChange = (newImageUrl) => {
        setPhotoId(newImageUrl);
        setSelectedImage(newImageUrl);
        setImageUrl(newImageUrl);

        const rectanglesForImage = loadRectanglesFromLocalStorage(newImageUrl);
        console.log(rectanglesForImage.lenth+"rectanglesForImage");
        setRectangles(rectanglesForImage);
        setRectanglesToDraw(rectanglesForImage);
    };

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



                <Box sx={{ height: '100%', overflowY: 'auto', marginTop: '20px', marginLeft: '30px', }}>
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
                                handleImageChange(uploadedImage.url);
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
                         fontWeight: '600' }}>
                        Total : {images.length}
                    </Box>

                    <Button
                        sx={{  position: 'fixed', bottom: '55px', marginLeft: '35px' }}
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
                    image={image}
                    initialColor={initialColor}
                    rectangles={imageRectangles[selectedImage] || []}
                    onRectanglesChange={handleRectanglesChange}
                    photoId={selectedImage}
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