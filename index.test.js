import { describe, it } from "node:test";
import assert from "node:assert";
import { isFakeDomain, isFakeEmail } from "./index.js";

// Mock data for testing
const mockJson = {
  domains: {
    "tempmail.com": {},
    "fakeemail.net": {},
    "throwaway.email": {},
    "guerrillamail.com": {},
  },
};

describe("isFakeDomain", () => {
  describe("exact domain matching", () => {
    it("should return domain for exact match", () => {
      const result = isFakeDomain("tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle case insensitivity", () => {
      const result = isFakeDomain("TEMPMAIL.COM", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle mixed case", () => {
      const result = isFakeDomain("TeMpMaIl.CoM", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should trim whitespace", () => {
      const result = isFakeDomain("  tempmail.com  ", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle whitespace and case together", () => {
      const result = isFakeDomain("  TEMPMAIL.COM  ", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should match different domains from the list", () => {
      assert.strictEqual(
        isFakeDomain("fakeemail.net", mockJson),
        "fakeemail.net"
      );
      assert.strictEqual(
        isFakeDomain("guerrillamail.com", mockJson),
        "guerrillamail.com"
      );
    });
  });

  describe("subdomain matching", () => {
    it("should match subdomain of fake domain", () => {
      const result = isFakeDomain("user.tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should match multiple levels of subdomains", () => {
      const result = isFakeDomain("deep.sub.tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should match subdomain with case insensitivity", () => {
      const result = isFakeDomain("USER.TEMPMAIL.COM", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should match subdomain with whitespace", () => {
      const result = isFakeDomain("  user.tempmail.com  ", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });
  });

  describe("non-matching domains", () => {
    it("should return false for legitimate domain", () => {
      const result = isFakeDomain("gmail.com", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for non-existent domain", () => {
      const result = isFakeDomain("notfakedomain.com", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for partial string match that is not subdomain", () => {
      const result = isFakeDomain("notatempmail.com", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for domain that contains fake domain but not as subdomain", () => {
      const result = isFakeDomain("tempmail.com.fake.org", mockJson);
      assert.strictEqual(result, false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = isFakeDomain("", mockJson);
      assert.strictEqual(result, false);
    });

    it("should handle domain without TLD", () => {
      const result = isFakeDomain("tempmail", mockJson);
      assert.strictEqual(result, false);
    });

    it("should handle single character domain", () => {
      const result = isFakeDomain("a", mockJson);
      assert.strictEqual(result, false);
    });

    it("should handle domain with only whitespace", () => {
      const result = isFakeDomain("   ", mockJson);
      assert.strictEqual(result, false);
    });

    it("should use default json when not provided", () => {
      // This test uses the actual data.json from the project
      const result = isFakeDomain("tempmail.com");
      // We expect this to be either false or a string depending on what's in data.json
      assert.ok(typeof result === "string" || result === false);
    });
  });

  describe("special characters", () => {
    it("should handle domain with hyphens", () => {
      const mockJsonWithHyphens = {
        domains: {
          "temp-mail.com": {},
        },
      };
      const result = isFakeDomain("temp-mail.com", mockJsonWithHyphens);
      assert.strictEqual(result, "temp-mail.com");
    });

    it("should handle subdomain with hyphens", () => {
      const result = isFakeDomain("my-user.tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle domain with numbers", () => {
      const mockJsonWithNumbers = {
        domains: {
          "temp123mail.com": {},
        },
      };
      const result = isFakeDomain("temp123mail.com", mockJsonWithNumbers);
      assert.strictEqual(result, "temp123mail.com");
    });
  });
});

describe("isFakeEmail", () => {
  describe("valid email addresses", () => {
    it("should detect fake email with exact domain match", () => {
      const result = isFakeEmail("user@tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should detect fake email with subdomain", () => {
      const result = isFakeEmail("user@sub.tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle email with case insensitive domain", () => {
      const result = isFakeEmail("user@TEMPMAIL.COM", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle email with whitespace in domain", () => {
      const result = isFakeEmail("user@  tempmail.com  ", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle complex email addresses", () => {
      const result = isFakeEmail("user.name+tag@tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should handle email with numbers", () => {
      const result = isFakeEmail("user123@tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });
  });

  describe("legitimate email addresses", () => {
    it("should return false for legitimate email", () => {
      const result = isFakeEmail("user@gmail.com", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for corporate email", () => {
      const result = isFakeEmail("employee@company.com", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for edu email", () => {
      const result = isFakeEmail("student@university.edu", mockJson);
      assert.strictEqual(result, false);
    });
  });

  describe("invalid email addresses", () => {
    it("should return false for email without @", () => {
      const result = isFakeEmail("notanemail", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for email without domain", () => {
      const result = isFakeEmail("user@", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for @ at the start", () => {
      const result = isFakeEmail("@tempmail.com", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for empty string", () => {
      const result = isFakeEmail("", mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for null", () => {
      const result = isFakeEmail(null, mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for undefined", () => {
      const result = isFakeEmail(undefined, mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for non-string input", () => {
      const result = isFakeEmail(12345, mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for object input", () => {
      const result = isFakeEmail({}, mockJson);
      assert.strictEqual(result, false);
    });

    it("should return false for array input", () => {
      const result = isFakeEmail([], mockJson);
      assert.strictEqual(result, false);
    });
  });

  describe("edge cases", () => {
    it("should return false for email with multiple @ symbols", () => {
      // Multiple @ symbols creates an invalid domain "name@tempmail.com" which won't match
      const result = isFakeEmail("user@name@tempmail.com", mockJson);
      assert.strictEqual(result, false);
    });

    it("should handle email with spaces", () => {
      const result = isFakeEmail("user @tempmail.com", mockJson);
      assert.strictEqual(result, "tempmail.com");
    });

    it("should use default json when not provided", () => {
      // This test uses the actual data.json from the project
      const result = isFakeEmail("user@tempmail.com");
      assert.ok(typeof result === "string" || result === false);
    });
  });

  describe("different fake domains", () => {
    it("should detect all fake domains in the list", () => {
      assert.strictEqual(
        isFakeEmail("user@tempmail.com", mockJson),
        "tempmail.com"
      );
      assert.strictEqual(
        isFakeEmail("user@fakeemail.net", mockJson),
        "fakeemail.net"
      );
      assert.strictEqual(
        isFakeEmail("user@throwaway.email", mockJson),
        "throwaway.email"
      );
      assert.strictEqual(
        isFakeEmail("user@guerrillamail.com", mockJson),
        "guerrillamail.com"
      );
    });
  });
});
