#!/bin/bash

# Take a screenshot of the device
adb shell screencap -p /sdcard/screenshot.png && adb pull /sdcard/screenshot.png screenshot-latest.png