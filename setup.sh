#!/bin/bash

readonly ROOT="/var/PiFrame"

if [ $(id -ru) = 0 ]; then
    echo "Please *do not* run as root"
    exit 1
fi

whatif=0
cleanup=1
logfile="./setup.log"

usage()
{
    echo "usage: setup [[-i ] [-w]] | [-h]"
    echo ""
    echo "-l|--log          Log path. Default is './setup.log'"
    echo "-i|--installonly  Do not uninstall programs not used by PiFrame."
    echo "-w|--whatif       See the list of commands that will be run without"
    echo "                  actually running them."
    echo "-h|--help         Show help."
}

while [ "$1" != "" ]; do
    case $1 in
        -l | --log )            shift
                                logfile=$1
                                ;;
        -i | --installonly )    cleanup=0
                                ;;
        -w | --whatif )         whatif=1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

echo $(date +"%x %r %Z") | tee $logfile
echo "installonly=$cleanup" | tee -a $logfile
echo "whatif=$whatif" | tee -a $logfile


if [ "$cleanup" = "1" ]; then
    # Unneeded packages
    pkgs="
    bluej
    debian-reference-en
    dillo
    geany geany-common
    greenfoot
    idle idle3
    libreoffice*
    minecraft-pi python-minecraftpi
    oracle-java8-jdk
    penguinspuzzle
    pistore
    python3-numpy
    python3-pifacecommon python3-pifacedigitalio python3-pifacedigital-scratch-handler python-pifacecommon python-pifacedigitalio
    python3-pygame python-pygame python-tk
    python3-tk
    python3-rpi.gpio
    python-serial python3-serial
    python-picamera python3-picamera
    scratch nuscratch
    smartsim
    sonic-pi
    timidity
    wolfram-engine
    vlc
    x2x
    "

    # Remove packages
    for i in $pkgs; do
        echo sudo apt-get -y remove --purge $i | tee -a $logfile
        if [ "$whatif" = "0" ]; then
            if [ $(dpkg-query -W -f='${Status}' $i 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
                sudo apt-get -y remove --purge $i | tee -a $logfile
            else
                echo "'$i' not installed, moving on."
            fi
        fi
    done

    # Remove automatically installed dependency packages
    echo sudo apt-get -y clean | tee -a $logfile
    echo sudo apt-get -y autoremove | tee -a $logfile
    if [ "$whatif" = "0" ]; then
        sudo apt-get -y clean | tee -a $logfile
        sudo apt-get -y autoremove | tee -a $logfile
    fi

    # Update and do a full upgrade of remaining packages
    echo sudo apt-get -y update | tee -a $logfile
    echo sudo apt-get -y upgrade | tee -a $logfile
    if [ "$whatif" = "0" ]; then
        sudo apt-get -y update | tee -a $logfile
        sudo apt-get -y upgrade | tee -a $logfile
    fi
else
    # Only update the package list
    echo sudo apt-get -y update | tee -a $logfile
    if [ "$whatif" = "0" ]; then
        sudo apt-get -y update | tee -a $logfile
    fi
fi

pkgs="
chromium
nginx
php-fpm
sed
unclutter
xdotool
"
# Install packages
for i in $pkgs; do
	echo sudo apt-get -y install $i | tee -a $logfile
    if [ "$whatif" = "0" ]; then
    	sudo apt-get -y install $i | tee -a $logfile
    fi
done

echo sudo apt-get -y clean | tee -a $logfile
echo sudo apt-get -y autoremove | tee -a $logfile
if [ "$whatif" = "0" ]; then
    sudo apt-get -y clean | tee -a $logfile
    sudo apt-get -y autoremove | tee -a $logfile
fi

#These need to run in the user's context
if [ -d ~/.config/lxsession/LXDE-pi/ ]; then
    echo "'~/.config/lxsession/LXDE-pi/' already exists" | tee -a $logfile
else
    echo "Making dir '~/.config/lxsession/LXDE-pi/'" | tee -a $logfile
    echo "mkdir -p ~/.config/lxsession/LXDE-pi/"
    if [ "$whatif" = "0" ]; then
        mkdir -p ~/.config/lxsession/LXDE-pi/
    fi
fi

#These need to run in the user's context
if [ -f ~/.config/lxsession/LXDE-pi/autostart ]; then
    echo "'~/.config/lxsession/LXDE-pi/autostart' already exists" | tee -a $logfile
else
    echo "Copying '~/.config/lxsession/LXDE-pi/autostart'" | tee -a $logfile
    echo "cp /etc/xdg/lxsession/LXDE-pi/autostart ~/.config/lxsession/LXDE-pi/"
    if [ "$whatif" = "0" ]; then
        cp /etc/xdg/lxsession/LXDE-pi/autostart ~/.config/lxsession/LXDE-pi/
    fi
fi

#These need to run in the user's context
if grep -q "@bash $ROOT/StartPiFrame.sh" ~/.config/lxsession/LXDE-pi/autostart; then
    echo "'@bash $ROOT/StartPiFrame.sh' command already exists" | tee -a $logfile
else
    echo "Appending '@bash $ROOT/StartPiFrame.sh'" | tee -a $logfile
    echo "echo '@bash $ROOT/StartPiFrame.sh' >> ~/.config/lxsession/LXDE-pi/autostart"
    if [ "$whatif" = "0" ]; then
        echo "@bash $ROOT/StartPiFrame.sh" >> ~/.config/lxsession/LXDE-pi/autostart
    fi
fi

echo "sudo mkdir -p $ROOT" | tee -a $logfile
echo "sudo git clone https://www.github.com/natefish/PiFrame $ROOT" | tee -a $logfile

echo "sudo chown -R $USER:$USER $ROOT/www" | tee -a $logfile
echo "sudo chmod -R 755 $ROOT" | tee -a $logfile

echo "sudo ln -s $piSite /etc/nginx/sites-enabled/" | tee -a $logfile
echo "sudo rm /etc/nginx/sites-enabled/default" | tee -a $logfile

piSiteConfig="server {
    #Only allow localhost
    listen 127.0.0.1;

    root $ROOT/www;
    index index.html

    server_name localhost;

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying a 404.
        try_files \$uri \$uri/ =404;
    }
}"

if [ "$whatif" = "0" ]; then
    if [ ! -d $ROOT ]; then
        sudo mkdir -p $ROOT
    fi

    sudo git clone https://www.github.com/natefish/PiFrame $ROOT

    sudo chown -R $USER:$USER $ROOT/www
    sudo chmod -R 755 $ROOT

    piSite="/etc/nginx/sites-available/PiFrame"

    if [ -f $piSite ]; then
        echo "File '$piSite' already exists!"
    else
        echo "$piSiteConfig" | sudo tee $piSite
    fi

    if [ ! -f /etc/nginx/sites-enabled/PiFrame ]; then
        sudo ln -s $piSite /etc/nginx/sites-enabled/
    fi
    if [ -f /etc/nginx/sites-enabled/default ]; then
        sudo rm /etc/nginx/sites-enabled/default
    fi
fi

if [ -f $ROOT/www/setings.txt ]; then
    echo "File '$ROOT/www/setings.txt' already exists!"
else
    echo cp $ROOT/www/settings-example.txt $ROOT/www/settings.txt
    if [ "$whatif" = "0" ]; then
        cp $ROOT/www/settings-example.txt $ROOT/www/settings.txt
    fi
fi
