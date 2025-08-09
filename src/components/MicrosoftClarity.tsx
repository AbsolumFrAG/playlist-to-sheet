"use client";

import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

export function MicrosoftClarity() {
  useEffect(() => {
    const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (!clarityProjectId) {
      console.warn(
        "Microsoft Clarity: Project ID not found in environment variables"
      );
      return;
    }

    // Initialize Microsoft Clarity with the project ID
    Clarity.init(clarityProjectId);

    console.log(
      "Microsoft Clarity initialized with project ID:",
      clarityProjectId
    );
  }, []);

  return null;
}
