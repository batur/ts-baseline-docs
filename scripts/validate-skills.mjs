#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { parse as parseYaml } from "yaml";

/**
 * @typedef {Record<string, unknown>} Frontmatter
 */

const REPO_ROOT = process.cwd();
const SKILLS_DIR = path.join(REPO_ROOT, ".agents", "skills");

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DESCRIPTION_MAX_LENGTH = 1024;
const RECOMMENDED_MAX_LINES = 500;

/** @type {string[]} */
const errors = [];

/** @type {string[]} */
const warnings = [];

/**
 * @param {string} message
 * @returns {void}
 */
function addError(message) {
  errors.push(message);
}

/**
 * @param {string} message
 * @returns {void}
 */
function addWarning(message) {
  warnings.push(message);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function getRelativePath(filePath) {
  return path.relative(REPO_ROOT, filePath).replaceAll(path.sep, "/");
}

/**
 * @param {unknown} value
 * @returns {value is Frontmatter}
 */
function isFrontmatterObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function getTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * @param {string} content
 * @param {string} skillFilePath
 * @returns {string | null}
 */
function extractFrontmatter(content, skillFilePath) {
  if (!content.startsWith("---\n")) {
    addError(`${getRelativePath(skillFilePath)}: missing YAML frontmatter.`);
    return null;
  }

  const closingMarker = "\n---";
  const closingIndex = content.indexOf(closingMarker, 4);

  if (closingIndex === -1) {
    addError(`${getRelativePath(skillFilePath)}: frontmatter closing marker not found.`);
    return null;
  }

  return content.slice(4, closingIndex);
}

/**
 * @param {string} content
 * @param {string} skillFilePath
 * @returns {Frontmatter | null}
 */
function parseFrontmatter(content, skillFilePath) {
  const rawFrontmatter = extractFrontmatter(content, skillFilePath);

  if (rawFrontmatter === null) {
    return null;
  }

  try {
    /** @type {unknown} */
    const parsed = parseYaml(rawFrontmatter);

    if (!isFrontmatterObject(parsed)) {
      addError(`${getRelativePath(skillFilePath)}: frontmatter must be a YAML object.`);
      return null;
    }

    return parsed;
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : String(caughtError);
    addError(`${getRelativePath(skillFilePath)}: invalid YAML frontmatter. ${message}`);
    return null;
  }
}

/**
 * @param {string} skillDirectoryName
 * @returns {void}
 */
function validateSkill(skillDirectoryName) {
  const skillDirectoryPath = path.join(SKILLS_DIR, skillDirectoryName);
  const skillFilePath = path.join(skillDirectoryPath, "SKILL.md");

  if (!statSync(skillDirectoryPath).isDirectory()) {
    return;
  }

  if (!existsSync(skillFilePath)) {
    addError(`${getRelativePath(skillDirectoryPath)}: missing SKILL.md.`);
    return;
  }

  const content = readFileSync(skillFilePath, "utf8");
  const lineCount = content.split(/\r?\n/).length;
  const frontmatter = parseFrontmatter(content, skillFilePath);

  if (lineCount > RECOMMENDED_MAX_LINES) {
    addWarning(
      `${getRelativePath(skillFilePath)}: ${String(lineCount)} lines. Recommended maximum is ${String(
        RECOMMENDED_MAX_LINES,
      )}.`,
    );
  }

  if (frontmatter === null) {
    return;
  }

  const name = getTrimmedString(frontmatter.name);
  const description = getTrimmedString(frontmatter.description);

  if (!name) {
    addError(`${getRelativePath(skillFilePath)}: missing required frontmatter field "name".`);
  }

  if (!description) {
    addError(
      `${getRelativePath(skillFilePath)}: missing required frontmatter field "description".`,
    );
  }

  if (name && name !== skillDirectoryName) {
    addError(
      `${getRelativePath(skillFilePath)}: frontmatter name "${name}" must match parent directory "${skillDirectoryName}".`,
    );
  }

  if (name && !NAME_PATTERN.test(name)) {
    addError(
      `${getRelativePath(skillFilePath)}: name "${name}" must use lowercase letters, numbers, and single hyphens only.`,
    );
  }

  if (description && description.length > DESCRIPTION_MAX_LENGTH) {
    addError(
      `${getRelativePath(skillFilePath)}: description is ${String(
        description.length,
      )} characters. Maximum is ${String(DESCRIPTION_MAX_LENGTH)}.`,
    );
  }
}

/**
 * @returns {string[]}
 */
function getSkillDirectoryNames() {
  return readdirSync(SKILLS_DIR)
    .filter((entryName) => {
      const entryPath = path.join(SKILLS_DIR, entryName);
      return statSync(entryPath).isDirectory();
    })
    .sort();
}

/**
 * @returns {void}
 */
function main() {
  if (!existsSync(SKILLS_DIR)) {
    addError(`Skills directory not found: ${getRelativePath(SKILLS_DIR)}`);
  } else {
    const skillDirectoryNames = getSkillDirectoryNames();

    if (skillDirectoryNames.length === 0) {
      addError(`${getRelativePath(SKILLS_DIR)}: no skill directories found.`);
    }

    for (const skillDirectoryName of skillDirectoryNames) {
      validateSkill(skillDirectoryName);
    }
  }

  if (warnings.length > 0) {
    console.warn("\nSkill validation warnings:");

    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.error("\nSkill validation failed:");

    for (const errorMessage of errors) {
      console.error(`- ${errorMessage}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Skill validation passed.");
}

main();
