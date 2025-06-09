import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Report = db.define('reports', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true, // Photo is optional
        comment: 'Path to uploaded photo file'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    report_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    freezeTableName: true,
    timestamps: true
});

export default Report;