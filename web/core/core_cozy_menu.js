/**
 * File: core_cozy_menu.js
 * Project: Jovimetrix
 */

import { app } from "../../../scripts/app.js"
import { CONVERTED_TYPE, convertToInput } from '../util/util_widget.js'

app.registerExtension({
    name: "jovimetrix.cozy.menu",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (!nodeData.name.includes("(JOV)")) {
            return;
        }

        let matchingTypes = [];
        const inputTypes = nodeData.input;
        if (inputTypes) {
            matchingTypes = ['required', 'optional']
                .flatMap(type => Object.entries(inputTypes[type] || [])
                );
            if (matchingTypes.length == 0) {
                return;
            }
        }

        // MENU CONVERSIONS
        const getExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
        nodeType.prototype.getExtraMenuOptions = async function (_, options) {
            const me = getExtraMenuOptions?.apply(this, arguments);
            if (this.widgets === undefined) {
                return me;
            }

            const convertToInputArray = [];
            const widgets = Object.values(this.widgets);
            for (const [widgetName, widgetType] of matchingTypes) {
                const widget = widgets.find(m => m.name === widgetName);
                if (widget && widget.type !== CONVERTED_TYPE &&
                    (widget.options?.forceInput === undefined || widget.options?.forceInput === false) &&
                    widget.options?.menu !== false) {
                        const convertToInputObject = {
                            content: `Convsert ${widget.name} to input`,
                            callback: () => convertToInput(this, widget, widgetType)
                        };
                        convertToInputArray.push(convertToInputObject);
                }
            }
            // remove all the options that start with the word "Convert" from the options...
            if (options) {
                options = options.filter(option => {
                    return typeof option?.content !== 'string' || !option?.content.startsWith('Convert');
                });
            }

            if (convertToInputArray.length) {
                options.push(...convertToInputArray, null);
            }
            return me;
        };
    }
})
