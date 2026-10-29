import { Request, Response } from "express";
import db from "../models";
import {
  POLLUTION_TYPES,
  PollutionReportAttributes,
  PollutionType
} from "../models/pollution-reports.model";

const PollutionReports = db.pollutionReports;
type PollutionReportInput = Omit<PollutionReportAttributes, "id">;

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reports = await PollutionReports.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(reports);
  } catch (error: unknown) {
    console.error("Failed to fetch pollution reports:", error);
    res.status(500).json({ message: "Failed to fetch pollution reports." });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Pollution id must be a positive integer." });
    return;
  }

  try {
    const report = await PollutionReports.findByPk(id);
    if (!report) {
      res.status(404).json({ message: `Pollution report ${id} was not found.` });
      return;
    }

    res.status(200).json(report);
  } catch (error: unknown) {
    console.error(`Failed to fetch pollution report ${id}:`, error);
    res.status(500).json({ message: "Failed to fetch pollution report." });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const report = parseReport(req.body);
  if (!report) {
    res.status(400).json({ message: "Pollution report data is invalid." });
    return;
  }

  try {
    const created = await PollutionReports.create(report);
    res.status(201).json(created);
  } catch (error: unknown) {
    console.error("Failed to create pollution report:", error);
    res.status(500).json({ message: "Failed to create pollution report." });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Pollution id must be a positive integer." });
    return;
  }

  const report = parseReport(req.body);
  if (!report) {
    res.status(400).json({ message: "Pollution report data is invalid." });
    return;
  }

  try {
    const existing = await PollutionReports.findByPk(id);
    if (!existing) {
      res.status(404).json({ message: `Pollution report ${id} was not found.` });
      return;
    }

    await existing.update(report);
    res.status(200).json(existing);
  } catch (error: unknown) {
    console.error(`Failed to update pollution report ${id}:`, error);
    res.status(500).json({ message: "Failed to update pollution report." });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Pollution id must be a positive integer." });
    return;
  }

  try {
    const deletedCount = await PollutionReports.destroy({ where: { id } });
    if (deletedCount === 0) {
      res.status(404).json({ message: `Pollution report ${id} was not found.` });
      return;
    }

    res.status(204).end();
  } catch (error: unknown) {
    console.error(`Failed to delete pollution report ${id}:`, error);
    res.status(500).json({ message: "Failed to delete pollution report." });
  }
};

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function parseReport(value: unknown): PollutionReportInput | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const report = value as Record<string, unknown>;
  const { title, type, description, observedAt, location, latitude, longitude } = report;
  const photoUrl = report["photoUrl"] ?? "";

  if (
    typeof title !== "string" ||
    title.trim().length < 5 ||
    title.trim().length > 120 ||
    typeof type !== "string" ||
    !isPollutionType(type) ||
    typeof description !== "string" ||
    description.trim().length < 20 ||
    description.trim().length > 2000 ||
    typeof observedAt !== "string" ||
    !isValidObservationDate(observedAt) ||
    typeof location !== "string" ||
    location.trim().length < 3 ||
    location.trim().length > 200 ||
    !/\p{L}/u.test(location) ||
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    typeof photoUrl !== "string" ||
    photoUrl.length > 2048 ||
    !isValidPhotoUrl(photoUrl)
  ) {
    return null;
  }

  return {
    title: title.trim(),
    type,
    description: description.trim(),
    observedAt,
    location: location.trim(),
    latitude,
    longitude,
    photoUrl
  };
}

function isPollutionType(value: string): value is PollutionType {
  return POLLUTION_TYPES.some((type) => type === value);
}

function isValidObservationDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value <= new Date().toISOString().slice(0, 10)
  );
}

function isValidPhotoUrl(value: string): boolean {
  if (value === "") {
    return true;
  }

  if (value !== value.trim() || /\s/.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname !== "" &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

export default { getAll, getById, create, update, remove };
