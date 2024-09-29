/**
 * This JavaScript file is designed to automate a process of interacting with posts on a webpage.
 *
 * Global Variables:
 * - isProcessRunning: A boolean flag to control the process state.
 *
 * DOM Elements:
 * - startButton: Button element to start the process.
 * - stopButton: Button element to stop the process.
 *
 * Event Listeners:
 * - startButton click event: Initiates the process if it's not already running.
 * - stopButton click event: Stops the process if it's currently running.
 *
 * Functions:
 * - startAutoProcess: Initiates the automated process of interacting with posts.
 * - stopAutoProcess: Stops the automated process.
 *
 * Internal Function:
 * - processNextPost: Handles the interaction with each post sequentially.
 *
 * Chrome Scripting:
 * - chrome.scripting.executeScript: Executes the start or stop functions in the active tab.
 *
 * Chrome Runtime Messaging:
 * - chrome.runtime.onMessage.addListener: Listens for messages to update the process state.
 */

// Global variable to control the process
let isProcessRunning = false;

const startButton = document.getElementById("startShootingArrow");
const stopButton = document.getElementById("stopShootingArrow");

if (startButton && stopButton) {
    startButton.addEventListener("click", () => {
        if (!isProcessRunning) {
            isProcessRunning = true;
            startButton.textContent = "Shooting...";
            stopButton.textContent = "Stop Shooting";
            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: startAutoProcess,
                    });
                },
            );
        }
    });

    stopButton.addEventListener("click", () => {
        if (isProcessRunning) {
            isProcessRunning = false;
            stopButton.textContent = "Stopping...";
            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: stopAutoProcess,
                    });
                },
            );
        }
    });
}

function startAutoProcess() {
    let currentPostIndex = 0;

    function processNextPost() {
        if (!window.isProcessRunning) {
            console.log("Process stopped.");
            chrome.runtime.sendMessage({ action: "processStopped" });
            return;
        }

        const posts = document.querySelectorAll(
            ".x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z",
        );

        if (posts.length > currentPostIndex) {
            const targetElement = posts[currentPostIndex];
            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            setTimeout(() => {
                if (!window.isProcessRunning) return;
                // Find and click the "Actions for this post" button
                const actionsButton = targetElement.querySelector(
                    'div[aria-label="Actions for this post"]',
                );
                if (actionsButton) {
                    actionsButton.click();
                    setTimeout(() => {
                        if (!window.isProcessRunning) return;
                        // Find and click the "Report post to group admins" button
                        const reportButton = Array.from(
                            document.querySelectorAll('div[role="menuitem"]'),
                        ).find((el) =>
                            el.textContent.includes(
                                "Report post to group admins",
                            ),
                        );
                        if (reportButton) {
                            reportButton.click();
                            setTimeout(() => {
                                if (!window.isProcessRunning) return;
                                // Click the specified element
                                const specificElement = document.querySelector(
                                    ".x1n2onr6:nth-child(10) .x1i10hfl > .x9f619 > .x9f619",
                                );
                                if (specificElement) {
                                    specificElement.click();
                                    setTimeout(() => {
                                        if (!window.isProcessRunning) return;
                                        // Find and click the "Done" button
                                        const doneButton =
                                            document.querySelector(
                                                'div[aria-label="Done"]',
                                            );
                                        if (doneButton) {
                                            doneButton.click();
                                            setTimeout(() => {
                                                if (!window.isProcessRunning)
                                                    return;
                                                console.log(
                                                    "Process completed for post " +
                                                        (currentPostIndex + 1),
                                                );
                                                currentPostIndex++;
                                                // Process the next post
                                                processNextPost();
                                            }, 1000);
                                        } else {
                                            console.log(
                                                'The "Done" button was not found.',
                                            );
                                            currentPostIndex++;
                                            // Move to next post even if "Done" button is not found
                                            processNextPost();
                                        }
                                    }, 1000);
                                } else {
                                    console.log(
                                        "The specified element was not found.",
                                    );
                                    currentPostIndex++;
                                    // Move to next post even if specific element is not found
                                    processNextPost();
                                }
                            }, 2000);
                        } else {
                            console.log(
                                'The "Report post to group admins" button was not found.',
                            );
                            currentPostIndex++;
                            // Move to next post even if "Report" button is not found
                            processNextPost();
                        }
                    }, 1000);
                } else {
                    console.log(
                        'The "Actions for this post" button was not found.',
                    );
                    currentPostIndex++;
                    // Move to next post even if "Actions" button is not found
                    processNextPost();
                }
            }, 1000);
        } else {
            console.log("All visible posts have been processed.");
            window.isProcessRunning = false;
            chrome.runtime.sendMessage({ action: "processStopped" });
        }
    }

    window.isProcessRunning = true;
    // Start the process with the first post
    processNextPost();
}

function stopAutoProcess() {
    window.isProcessRunning = false;
    console.log("Process has been stopped.");
    chrome.runtime.sendMessage({ action: "processStopped" });
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "processStopped") {
        isProcessRunning = false;
        startButton.textContent = "Start Shooting";
        stopButton.textContent = "Stop Shooting";
    }
});
