import { describe, it, expect } from "vitest";
import { formatDateTime, formatDateShort, cn } from "../utils";
import {
  BAIRROS_OLINDA,
  generateRegistrationShareWhatsApp,
  isValidOlindaNeighborhood,
} from "../olinda";
import { sendWhatsappOtpToAthlete } from "../whatsapp";

describe("Utils & Olinda Helpers", () => {
  it("should combine CSS classes with cn", () => {
    expect(cn("bg-red-500", true && "text-white", false && "hidden")).toBe("bg-red-500 text-white");
  });

  it("should format dates correctly", () => {
    const testDate = new Date("2026-08-24T14:00:00Z");
    expect(formatDateTime(testDate)).toBeDefined();
    expect(formatDateShort(testDate)).toBeDefined();
  });

  it("should return empty string on null date", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateShort(null)).toBe("");
  });

  it("should validate Olinda neighborhoods list", () => {
    expect(BAIRROS_OLINDA).toContain("Rio Doce");
    expect(BAIRROS_OLINDA).toContain("Peixinhos");
    expect(BAIRROS_OLINDA).toContain("Alto da Sé / Carmo");
    expect(isValidOlindaNeighborhood("Rio Doce")).toBe(true);
    expect(isValidOlindaNeighborhood("Copacabana")).toBe(false);
  });

  it("should generate proper WhatsApp share URL", () => {
    const url = generateRegistrationShareWhatsApp({
      athleteName: "Dadá",
      tournamentTitle: "Circuito Rio Doce",
      neighborhood: "Rio Doce",
      hubUrl: "https://futmesa.olinda.pe/torneios/123",
    });

    expect(url).toContain("https://api.whatsapp.com/send?text=");
    expect(url).toContain("Dad");
  });

  it("should send WhatsApp OTP directly to athlete", async () => {
    const result = await sendWhatsappOtpToAthlete({
      phone: "(81) 98888-7777",
      athleteName: "Dadá",
      tournamentTitle: "Circuito Futmesa",
      code: "749102",
    });

    expect(result.success).toBe(true);
  });
});


