import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export default function defineUsers(sequelize: Sequelize) {
  return sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING(161),
        allowNull: false
      }
    },
    {
      tableName: "users",
      freezeTableName: true,
      timestamps: false
    }
  );
}
