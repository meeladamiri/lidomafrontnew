/**
 * The wizard's own copy, from the panel.
 *
 * Step titles used to be a map in `constants/Residences/Submit/Steps_Title.ts`
 * and the option tiles three arrays in `getAllowedValues.ts`, all sharing one
 * placeholder image. Odoo had this configurable and the migration lost it, so
 * nobody could rename a step, explain one, or put a real photograph on a tile
 * without a deploy.
 *
 * Those files are still here and still used — as the fallback. If this request
 * fails or the panel has never been touched, the wizard renders exactly what
 * it rendered before rather than a page of blanks.
 */

import apiBuilder from "../apiBuilder";

export type WizardOptionKind = "RES_TYPE" | "REGION" | "RENT_TYPE";

export interface WizardStepContent {
  step: number;
  title: string;
  description: string | null;
  help_text: string | null;
  icon_url: string | null;
}

export interface WizardOptionContent {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
}

export interface WizardContent {
  steps: WizardStepContent[];
  options: Record<WizardOptionKind, WizardOptionContent[]>;
}

export async function getWizardContent(): Promise<WizardContent | null> {
  const res = await apiBuilder
    .setUrl("/api/host/residences/wizard-content")
    .setCallMethod("GET")
    .call();

  return res?.status === "success" ? (res.data as WizardContent) : null;
}
