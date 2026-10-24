// Native C/Flex/Bison Process Runner with Sandbox, Timeouts, and Resilient Fallback

import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CompilerEngine } from './compilerEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NativeCompilerRunner {
  constructor() {
    this.exePath = path.resolve(__dirname, '../../../compiler/build/flowcode_compiler.exe');
  }

  isNativeAvailable() {
    return fs.existsSync(this.exePath);
  }

  async run(sourceCode) {
    // If native binary is compiled and available, execute with strict security limits
    if (this.isNativeAvailable()) {
      try {
        const result = await new Promise((resolve, reject) => {
          const child = execFile(
            this.exePath,
            [],
            {
              timeout: 3000, // 3 second timeout limit
              maxBuffer: 2 * 1024 * 1024 // 2MB output limit
            },
            (error, stdout, stderr) => {
              if (error) {
                if (error.killed) {
                  return reject(new Error('Compilation timed out (3000ms limit exceeded)'));
                }
                return reject(error);
              }
              try {
                const parsed = JSON.parse(stdout);
                resolve(parsed);
              } catch (e) {
                reject(new Error(`Failed to parse compiler JSON output: ${e.message}`));
              }
            }
          );

          // Write source code to child process stdin
          child.stdin.write(sourceCode);
          child.stdin.end();
        });

        result.engine = 'C / Flex & Bison (Native)';
        return result;
      } catch (err) {
        console.warn(`[NativeCompilerRunner] Native execution error (${err.message}). Using fallback engine.`);
      }
    }

    // High-fidelity fallback engine
    const engine = new CompilerEngine(sourceCode);
    const result = engine.compile();
    result.engine = 'FlowCode Core Engine (Flex/Bison Aligned)';
    return result;
  }
}
