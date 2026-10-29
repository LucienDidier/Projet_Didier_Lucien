import { Request, Response } from "express";
import db from "../models";

const Pollutions = db.pollutions;

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error("Failed to fetch legacy pollution measurements:", error);
    res.status(500).json({ message: "Failed to fetch pollution measurements." });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Pollution id must be a positive integer." });
    return;
  }

  try {
    const data = await Pollutions.findByPk(id);
    if (!data) {
      res.status(404).json({ message: `Pollution ${id} was not found.` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(`Failed to fetch legacy pollution measurement ${id}:`, error);
    res.status(500).json({ message: "Failed to fetch pollution measurement." });
  }
};

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default { getAll, getById };
