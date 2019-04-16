#!/bin/bash

readonly ROOT="/var/PiFrame/www"

iPath="$ROOT/images-example.xml"
rFolder="$ROOT/images/sample"

if [ -f $ROOT/settings.txt ]; then
    echo "Found settings file"
    tPath=$(grep -Po '"imgList":.*?[^\\]",' $ROOT/settings.txt)
    if [ "$tPath" != "" ]; then
        tPath=$(echo $tPath | cut -d':' -f 2 | sed 's/^[ \t]*//;s/"//;s/[", \t]*$//' )
        iPath="$ROOT/$tPath"
    fi

    tFolder=$(grep -Po '"imagePath":.*?[^\\]",' $ROOT/settings.txt)
    if [ "$tFolder" != "" ]; then
        tFolder=$(echo $tFolder | cut -d':' -f 2 | sed 's/^[ \t]*//;s/"//;s/[", \t]*$//')
        rFolder="$ROOT/$tFolder"
    fi
    echo "iPath: $iPath"
    echo "rFolder: $rFolder"
fi

# Install packages
echo "<?xml version='1.0' encoding='UTF-8'?>">$iPath
echo "<images>">>$iPath

pushd $rFolder
for i in $( ls *.* ); do
    echo "<img>$i</img>" | sed 's/^/   /'>>$iPath
done
popd
echo "</images>">>$iPath

exit

xset s noblank &
xset s off &
xset -dpms &

unclutter -idle 0.5 -root &

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/pi/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/pi/.config/chromium/Default/Preferences

/usr/bin/chromium --no-first-run --noerrdialogs --disable-infobars  --disable-notifications --start-fullscreen --ignore-certificate-errors --app=http://localhost &
