import * as fs from 'fs';
import * as path from 'path';
import { sprintf } from 'sprintf-js';

interface PseudoElementConfig {
    position: 'before' | 'after';
    properties: PseudoProperty[];
}

interface PseudoProperty {
    name: string;
    defaultValue: string;
    cssProperty: string;
}

interface WidgetVariable {
    name: string;
    defaultValue: string;
}

interface GeneratedOutput {
    variablesContent: string;
    widgetClassesContent: string;
}

const SRC_DIR: string = path.join(__dirname, 'src/generic');
const VARIABLES_FILE: string = path.join(__dirname, 'generative/variables.scss');
const WIDGET_FILE: string = path.join(__dirname, 'generative/widget-container.scss');

const EXCLUDED_DIRS: string[] = ['part', 'plugin'];
const STRIPPED_PREFIXES: string[] = ['rc-', 'nv-'];

const BASE_VARIABLES: WidgetVariable[] = [
    { name: 'padding', defaultValue: 'var(--pobo-global-widget-padding)' },
    { name: 'margin', defaultValue: 'var(--pobo-global-widget-margin)' },
    { name: 'box-shadow', defaultValue: 'none' },
    { name: 'bg', defaultValue: 'none' },
    { name: 'bg-size', defaultValue: 'auto' },
    { name: 'border-radius', defaultValue: '0' },
];

const PSEUDO_ELEMENTS: PseudoElementConfig[] = [
    {
        position: 'before',
        properties: [
            { name: 'bg', defaultValue: 'none', cssProperty: 'background' },
            { name: 'top', defaultValue: '0', cssProperty: 'top' },
            { name: 'left', defaultValue: '0', cssProperty: 'left' },
            { name: 'width', defaultValue: '0', cssProperty: 'width' },
            { name: 'height', defaultValue: '0', cssProperty: 'height' },
            { name: 'index', defaultValue: '0', cssProperty: 'z-index' },
        ],
    },
    {
        position: 'after',
        properties: [
            { name: 'bg', defaultValue: 'none', cssProperty: 'background' },
            { name: 'top', defaultValue: '0', cssProperty: 'bottom' },
            { name: 'right', defaultValue: '0', cssProperty: 'right' },
            { name: 'width', defaultValue: '0', cssProperty: 'width' },
            { name: 'height', defaultValue: '0', cssProperty: 'height' },
            { name: 'index', defaultValue: '0', cssProperty: 'z-index' },
        ],
    },
];

function extractClassName(filename: string): string {
    const name = filename.replace('.scss', '');
    for (const prefix of STRIPPED_PREFIXES) {
        if (name.startsWith(prefix)) {
            return name.substring(prefix.length);
        }
    }
    return name;
}

function isExcludedFile(filePath: string): boolean {
    return EXCLUDED_DIRS.some((dir) => filePath.startsWith(dir));
}

function generateVariables(className: string): string {
    let content = '';

    for (const variable of BASE_VARIABLES) {
        content += sprintf(' --pobo-widget-%s-%s: %s;\n', className, variable.name, variable.defaultValue);
    }

    for (const pseudo of PSEUDO_ELEMENTS) {
        for (const prop of pseudo.properties) {
            content += sprintf(' --pobo-widget-%s-%s-%s: %s;\n', className, pseudo.position, prop.name, prop.defaultValue);
        }
    }

    return content;
}

function generatePseudoElement(className: string, pseudo: PseudoElementConfig): string {
    let content = sprintf('&::%s {\n', pseudo.position);
    content += 'content: " ";\n';
    content += 'position: absolute;\n';

    for (const prop of pseudo.properties) {
        content += sprintf('%s: var(--pobo-widget-%s-%s-%s);\n', prop.cssProperty, className, pseudo.position, prop.name);
    }

    content += '}\n\n';
    return content;
}

function generateWidgetClass(className: string): string {
    let content = sprintf('.widget-%s {\n', className);

    for (const pseudo of PSEUDO_ELEMENTS) {
        content += generatePseudoElement(className, pseudo);
    }

    content += sprintf('box-shadow: var(--pobo-widget-%s-box-shadow);\n', className);
    content += sprintf('padding: var(--pobo-widget-%s-padding);\n', className);
    content += sprintf('margin: var(--pobo-widget-%s-margin);\n', className);
    content += sprintf('background: var(--pobo-widget-%s-bg);\n', className);
    content += sprintf('background-size: var(--pobo-widget-%s-bg-size);\n', className);
    content += sprintf('border-radius: var(--pobo-widget-%s-border-radius);\n', className);
    content += '}\n\n';

    return content;
}

function processFiles(files: string[]): GeneratedOutput {
    let variablesContent = ':root {\n';
    let widgetClassesContent = '';
    const classNames = new Set<string>();

    for (const file of files) {
        const basename = path.basename(file);

        if (!basename.endsWith('.scss') || isExcludedFile(file)) {
            continue;
        }

        const className = extractClassName(basename);

        if (className && !classNames.has(className)) {
            classNames.add(className);
            variablesContent += generateVariables(className);
            widgetClassesContent += generateWidgetClass(className);
        }
    }

    variablesContent += '}';

    return { variablesContent, widgetClassesContent };
}

function generateFiles(): void {
    fs.readdir(SRC_DIR, { recursive: true }, (err, files) => {
        if (err) {
            console.error('Error reading the directory:', err);
            return;
        }

        const { variablesContent, widgetClassesContent } = processFiles(files as string[]);

        fs.writeFile(VARIABLES_FILE, variablesContent, (err) => {
            if (err) {
                console.error('Error writing the variables file:', err);
                return;
            }
            console.log(sprintf('Variables were successfully generated in %s', VARIABLES_FILE));
        });

        fs.writeFile(WIDGET_FILE, widgetClassesContent, (err) => {
            if (err) {
                console.error('Error writing the widget classes file:', err);
                return;
            }
            console.log(sprintf('Widget classes were successfully generated in %s', WIDGET_FILE));
        });
    });
}

generateFiles();
