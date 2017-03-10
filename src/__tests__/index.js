import jsdom from "jsdom";

import {StyleSheet, css} from "../index.js";

describe("smallaph", () => {
    beforeEach(() => {
        global.document = jsdom.jsdom();
    });

    afterEach(() => {
        global.document.close();
        delete global.document;
    });

    it("inserts some styles", () => {
        const styles = StyleSheet.create({
            red: {
                color: "red",
            },

            blue: {
                color: "blue",
            },

            round: {
                borderRadius: "2px",
            },

            hover: {
                ":hover": {
                    color: "green",
                },
            },

            media: {
                "@media screen": {
                    color: "black",
                },
            },
        });

        expect(css(styles.red)).toEqual(".red");
        expect(css(styles.red, styles.blue)).toEqual(".red-blue");
        expect(css(styles.red, false)).toEqual(".red");
        expect(css(styles.round)).toEqual(".round");
        expect(css(styles.hover)).toEqual(".hover");
        expect(css(styles.media)).toEqual(".media");

        const sheet = document.querySelector("[data-smallaph]");
        expect(sheet.textContent).toEqual(
            ".red{color: red !important;}" +
            ".red-blue{color: blue !important;}" +
            ".round{border-radius: 2px !important;}" +
            ".hover:hover{color: green !important;}" +
            "@media screen{ .media{color: black !important;} }"
        );
    });
});
