import { describe, it } from "node:test";
import assert from "node:assert";
import { isFakeDomain, isFakeEmail, isPlusAddressingEmail } from "./index.js";

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

describe("isPlusAddressingEmail", () => {
  describe("emails with plus addressing", () => {
    it("should return true for email with plus in local part", () => {
      const result = isPlusAddressingEmail("user+tag@example.com");
      assert.strictEqual(result, true);
    });

    it("should return true for email with plus and text after", () => {
      const result = isPlusAddressingEmail("john+shopping@gmail.com");
      assert.strictEqual(result, true);
    });

    it("should return true for email with plus at end of local part", () => {
      const result = isPlusAddressingEmail("user+@example.com");
      assert.strictEqual(result, true);
    });

    it("should return true for email with multiple plus signs", () => {
      const result = isPlusAddressingEmail("user+tag+extra@example.com");
      assert.strictEqual(result, true);
    });

    it("should return true for email with numbers after plus", () => {
      const result = isPlusAddressingEmail("user+123@example.com");
      assert.strictEqual(result, true);
    });

    it("should return true for email with special characters after plus", () => {
      const result = isPlusAddressingEmail("user+tag.test@example.com");
      assert.strictEqual(result, true);
    });

    it("should return true for short local part with plus", () => {
      const result = isPlusAddressingEmail("a+b@example.com");
      assert.strictEqual(result, true);
    });

    it("should return true for complex local part with plus", () => {
      const result = isPlusAddressingEmail("first.last+tag123@example.com");
      assert.strictEqual(result, true);
    });
  });

  describe("emails without plus addressing", () => {
    it("should return false for email without plus sign", () => {
      const result = isPlusAddressingEmail("user@example.com");
      assert.strictEqual(result, false);
    });

    it("should return false for email with dots but no plus", () => {
      const result = isPlusAddressingEmail("first.last@example.com");
      assert.strictEqual(result, false);
    });

    it("should return false for email with numbers but no plus", () => {
      const result = isPlusAddressingEmail("user123@example.com");
      assert.strictEqual(result, false);
    });

    it("should return false for email with hyphens but no plus", () => {
      const result = isPlusAddressingEmail("user-name@example.com");
      assert.strictEqual(result, false);
    });

    it("should return false for email with underscores but no plus", () => {
      const result = isPlusAddressingEmail("user_name@example.com");
      assert.strictEqual(result, false);
    });

    it("should return false for simple email", () => {
      const result = isPlusAddressingEmail("test@gmail.com");
      assert.strictEqual(result, false);
    });
  });

  describe("emails with plus in domain", () => {
    it("should return false for plus only in domain part", () => {
      // Plus sign is in domain, not local part
      const result = isPlusAddressingEmail("user@example+domain.com");
      assert.strictEqual(result, false);
    });

    it("should return true for plus in local part even if plus in domain", () => {
      const result = isPlusAddressingEmail("user+tag@example+domain.com");
      assert.strictEqual(result, true);
    });
  });

  describe("invalid email formats", () => {
    it("should return false for email without @", () => {
      const result = isPlusAddressingEmail("userexample.com");
      assert.strictEqual(result, false);
    });

    it("should return false for email with @ at start", () => {
      const result = isPlusAddressingEmail("@example.com");
      assert.strictEqual(result, false);
    });

    it("should return false for email with @ at end", () => {
      const result = isPlusAddressingEmail("user@");
      assert.strictEqual(result, false);
    });

    it("should return false for email with only @", () => {
      const result = isPlusAddressingEmail("@");
      assert.strictEqual(result, false);
    });

    it("should return false for string with plus but no @", () => {
      const result = isPlusAddressingEmail("user+tag");
      assert.strictEqual(result, false);
    });

    it("should return true for multiple @ symbols if local part has plus", () => {
      // Even though this is invalid email format, the function checks the local part
      const result = isPlusAddressingEmail("user+tag@name@example.com");
      assert.strictEqual(result, true);
    });
  });

  describe("edge cases", () => {
    it("should return false for empty string", () => {
      const result = isPlusAddressingEmail("");
      assert.strictEqual(result, false);
    });

    it("should return false for null", () => {
      const result = isPlusAddressingEmail(null);
      assert.strictEqual(result, false);
    });

    it("should return false for undefined", () => {
      const result = isPlusAddressingEmail(undefined);
      assert.strictEqual(result, false);
    });

    it("should return false for non-string number", () => {
      const result = isPlusAddressingEmail(12345);
      assert.strictEqual(result, false);
    });

    it("should return false for object", () => {
      const result = isPlusAddressingEmail({});
      assert.strictEqual(result, false);
    });

    it("should return false for array", () => {
      const result = isPlusAddressingEmail([]);
      assert.strictEqual(result, false);
    });

    it("should return false for boolean", () => {
      const result = isPlusAddressingEmail(true);
      assert.strictEqual(result, false);
    });

    it("should return false for whitespace only", () => {
      const result = isPlusAddressingEmail("   ");
      assert.strictEqual(result, false);
    });
  });

  describe("special formatting", () => {
    it("should return true for email with spaces around plus", () => {
      // Note: This is technically invalid email format, but the function checks if plus exists
      const result = isPlusAddressingEmail("user + tag@example.com");
      assert.strictEqual(result, true);
    });

    it("should handle email with leading/trailing spaces", () => {
      const result = isPlusAddressingEmail("  user+tag@example.com  ");
      assert.strictEqual(result, true);
    });

    it("should handle uppercase email with plus", () => {
      const result = isPlusAddressingEmail("USER+TAG@EXAMPLE.COM");
      assert.strictEqual(result, true);
    });

    it("should handle mixed case email with plus", () => {
      const result = isPlusAddressingEmail("UsEr+TaG@ExAmPlE.com");
      assert.strictEqual(result, true);
    });
  });
});
