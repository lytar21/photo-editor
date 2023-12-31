import React from "react";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import axios from "axios";

const ContextMenu = ({ onClose, onDelete, isOpen, position,listOfColors}) => {
    const handleClose = () => {
        onClose();
    };

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    const handleColorChange = (color) => () => {
        onClose(color);
    };
    
    return (
        <Menu
            id="context-menu"
            anchorReference="anchorPosition"
            anchorPosition = {{top: position.y, left: position.x}}
            open={isOpen}
            onClose={handleClose}
        >{ JSON.parse(localStorage.getItem('rectangles')).map((color, index) => (
                <MenuItem key={index} onClick={handleColorChange(color.color)}>{color.name}</MenuItem>
            ))}
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
    );
};

export default ContextMenu;
