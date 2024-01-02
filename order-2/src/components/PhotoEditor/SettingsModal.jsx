import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ColorPicker from 'react-color';
import axios from 'axios';
let k = 1;

const SettingsModal = ({ open, onClose, onColorChange }) => {
    const [rectangles, setRectangles] = useState([
        { name: '1', color: '#ff0000', default: true }
    ]);
    localStorage.setItem('rectangles', JSON.stringify(rectangles));
    // rectangles.map((rect, index) => (
    //     axios.post('http://localhost:5002/colors/create', {
    //         name: rect.name,
    //         hex: rect.color,
    //     }).then(res => {
    //         console.log(res.data);
    //     }).catch(err => {
    //         console.log(err);
    //     })
    // ));
    // axios.get('http://localhost:5002/colors/findAll').then(res => {
    //     console.log(res.data);
    // }).catch(err => {
    //     console.log(err);
    // }
    // );

    // axios.post('http://localhost:5001/settings/create', {
    //   name: 'default',
    //   color : '#000000',
    // }).then(res => {
    //   console.log(res.data);
    // }).catch(err => {
    //   console.log(err);
    // });

    // axios.get('http://localhost:5001/settings/findAll').then(res => {
    //   console.log(res.data);
    // }).catch(err => {
    //   console.log(err);
    // }
    // );


    const handleAddRectangle = () => {
        setRectangles([...rectangles, { name: `${++k}`, color: '#ff0000', default: false }]);
    };

    const handleInputChange = (index, key, value) => {
        const updatedRectangles = [...rectangles];
        updatedRectangles[index][key] = value;
        setRectangles(updatedRectangles);
    };

    const handleColorChange = (index, color) => {
        const updatedRectangles = [...rectangles];
        updatedRectangles[index].color = color.hex;
        localStorage.setItem('rectangles', JSON.stringify(color.hex));
        setRectangles(updatedRectangles);

        onColorChange(color.hex);
    };

    const handleRadioChange = (index) => {
        const updatedRectangles = rectangles.map((rect, i) => ({
            ...rect,
            default: i === index
        }));
    
        setRectangles(updatedRectangles);
    
        if (updatedRectangles[index].default) {
            onColorChange(updatedRectangles[index].color);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height : '96%', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}
            >
                <Typography variant="h6" component="div" gutterBottom>
                    Rectangle Settings
                </Typography>

                <div style={{ maxHeight: '93%', overflowY: 'auto' }}>
                    {rectangles.map((rect, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <TextField
                                label={'Name'}
                                value={rect.name}
                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                style={{ marginBottom: '10px', display: 'block' }}
                            />

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <ColorPicker
                                    color={rect.color}
                                    onChange={(color) => handleColorChange(index, color)}
                                    style={{ marginRight: '10px' }}
                                />
                            </div>

                            <RadioGroup
                                row
                                aria-label={`Rectangle ${index + 1}`}
                                name={`rectangle${index + 1}`}
                                value={rect.default.toString()}
                                onChange={() => handleRadioChange(index)}
                                style={{ display: 'flex' }}
                            >
                                <FormControlLabel value="true" control={<Radio />} label="Default" />
                            </RadioGroup>
                        </div>
                    ))}
                </div>

                <Button variant="contained" onClick={handleAddRectangle} style={{ marginRight: '10px' }}>
                    +
                </Button>

                <Button variant="contained" onClick={onClose}>
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default SettingsModal;
