"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="vitest" />
var vite_1 = require("vite");
exports.default = (0, vite_1.defineConfig)({
    test: {
        clearMocks: true,
        coverage: {
            enabled: true,
        },
        reporters: ['default', 'html'],
    },
});
