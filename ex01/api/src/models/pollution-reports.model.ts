import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export const POLLUTION_TYPES = [
  "Plastique",
  "Chimique",
  "Dépôt sauvage",
  "Eau",
  "Air",
  "Autre"
] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

export interface PollutionReportAttributes {
  id: number;
  title: string;
  type: PollutionType;
  description: string;
  observedAt: string;
  location: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
}

export interface PollutionReportCreationAttributes
  extends Optional<PollutionReportAttributes, "id"> {}

export interface PollutionReportInstance
  extends Model<PollutionReportAttributes, PollutionReportCreationAttributes>,
    PollutionReportAttributes {}

export default function definePollutionReports(sequelize: Sequelize) {
  return sequelize.define<PollutionReportInstance>(
    "pollution_report",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(...POLLUTION_TYPES),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(2000),
        allowNull: false
      },
      observedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      photoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        defaultValue: ""
      }
    },
    {
      tableName: "pollution_reports",
      freezeTableName: true,
      timestamps: false
    }
  );
}
