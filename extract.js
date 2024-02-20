const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/generic');
const variablesFile = path.join(__dirname, 'generative/variables.scss');
const widgetFile = path.join(__dirname, 'generative/widget-container.scss');

function extractClassName(filename) {
    return filename.split('-').slice(1).join('-').replace('.scss', '');
}

function generateFiles() {
    fs.readdir(srcDir, (err, files) => {
        if (err) {
            console.error('Error reading the directory:', err);
            return;
        }

        let variablesContent = ':root {\n';
        let widgetClassesContent = '';
        const classNames = new Set();

        files.forEach(file => {
            if (file.endsWith('.scss')) {
                const className = extractClassName(file);
                if (!classNames.has(className)) {
                    classNames.add(className);

                    variablesContent += ` --pobo-widget-${className}-padding: var(--pobo-global-widget-padding);\n`;
                    variablesContent += ` --pobo-widget-${className}-margin: var(--pobo-global-widget-margin);\n`;

                    variablesContent += ` --pobo-widget-${className}-box-shadow: none;\n`;
                    variablesContent += ` --pobo-widget-${className}-bg: none;\n`;
                    variablesContent += ` --pobo-widget-${className}-bg-size: auto;\n`;
                    variablesContent += ` --pobo-widget-${className}-border-radius: 0;\n`;

                    // Before
                    variablesContent += ` --pobo-widget-${className}-before-bg: none;\n`;
                    variablesContent += ` --pobo-widget-${className}-before-top: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-before-left: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-before-width: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-before-height: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-before-index: 0;\n`;

                    // Before
                    widgetClassesContent += `.widget-${className} {\n`;
                    widgetClassesContent += `&::before {\n`;
                    widgetClassesContent += `content: " ";\n`;
                    widgetClassesContent += `position: absolute;\n`;
                    widgetClassesContent += `top: var(--pobo-widget-${className}-before-top);\n`;
                    widgetClassesContent += `left: var(--pobo-widget-${className}-before-left);\n`;
                    widgetClassesContent += `width: var(--pobo-widget-${className}-before-width);\n`;
                    widgetClassesContent += `height: var(--pobo-widget-${className}-before-height);\n`;
                    widgetClassesContent += `background: var(--pobo-widget-${className}-before-bg);\n`;
                    widgetClassesContent += `z-index: var(--pobo-widget-${className}-before-index);\n`;
                    widgetClassesContent += `}\n\n`;

                    // After
                    variablesContent += ` --pobo-widget-${className}-after-bg: none;\n`;
                    variablesContent += ` --pobo-widget-${className}-after-top: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-after-right: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-after-width: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-after-height: 0;\n`;
                    variablesContent += ` --pobo-widget-${className}-after-index: 0;\n`;

                    // After
                    widgetClassesContent += `&::after {\n`;
                    widgetClassesContent += `content: " ";\n`;
                    widgetClassesContent += `position: absolute;\n`;
                    widgetClassesContent += `bottom: var(--pobo-widget-${className}-after-top);\n`;
                    widgetClassesContent += `right: var(--pobo-widget-${className}-after-right);\n`;
                    widgetClassesContent += `width: var(--pobo-widget-${className}-after-width);\n`;
                    widgetClassesContent += `height: var(--pobo-widget-${className}-after-height);\n`;
                    widgetClassesContent += `background: var(--pobo-widget-${className}-after-bg);\n`;
                    widgetClassesContent += `z-index: var(--pobo-widget-${className}-after-index);\n`;
                    widgetClassesContent += `}\n\n`;



                    // add box shadow
                    widgetClassesContent += `box-shadow: var(--pobo-widget-${className}-box-shadow);\n`;
                    widgetClassesContent += `padding: var(--pobo-widget-${className}-padding);\n`;
                    widgetClassesContent += `margin: var(--pobo-widget-${className}-margin);\n`;
                    widgetClassesContent += `background: var(--pobo-widget-${className}-bg);\n`;
                    widgetClassesContent += `background-size: var(--pobo-widget-${className}-bg-size);\n`;
                    widgetClassesContent += `border-radius: var(--pobo-widget-${className}-border-radius);\n`;
                    widgetClassesContent += '}\n\n';

                  //  widgetClassesContent += ` --pobo-widget-${className}-margin: 0;\n`;
                   // widgetClassesContent += ` --pobo-widget-${className}-bg: none;\n}\n\n`;


                }
            }
        });

        variablesContent += '}';

        fs.writeFile(variablesFile, variablesContent, (err) => {
            if (err) {
                console.error('Error writing the variables file:', err);
                return;
            }
            console.log(`Variables were successfully generated in ${variablesFile}`);
        });

        fs.writeFile(widgetFile, widgetClassesContent, (err) => {
            if (err) {
                console.error('Error writing the widget classes file:', err);
                return;
            }
            console.log(`Widget classes were successfully generated in ${widgetFile}`);
        });
    });
}

generateFiles();
