#!/bin/bash

export DISPLAY=:0.0 && xdotool key --window "$(xdotool search --onlyvisible --class chromium | head -n 1)" Ctrl+F5

