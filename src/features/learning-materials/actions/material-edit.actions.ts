"use server";

import {
  deleteMaterial,
  getMaterialForEdit,
  updateMaterial,
} from "@/features/learning-materials/services/material-edit.service";
import type {
  MaterialDeleteResult,
  MaterialEditInput,
  MaterialEditResult,
  GetMaterialForEditResult,
} from "@/features/learning-materials/types/material.types";

export async function getMaterialForEditAction(
  materialId: string,
): Promise<GetMaterialForEditResult> {
  return getMaterialForEdit(materialId);
}

export async function updateMaterialAction(
  materialId: string,
  input: MaterialEditInput,
): Promise<MaterialEditResult> {
  return updateMaterial(materialId, input);
}

export async function deleteMaterialAction(
  materialId: string,
): Promise<MaterialDeleteResult> {
  return deleteMaterial(materialId);
}
