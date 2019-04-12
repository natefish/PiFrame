#!/bin/bash

if [ $(id -ru) != 0 ]; then
    echo "Please run as root"
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
        echo apt-get -y remove --purge $i | tee -a $logfile
        if [ "$whatif" = "0" ]; then
            apt-get -y remove --purge $i | tee -a $logfile
        fi
    done

    # Remove automatically installed dependency packages
    echo apt-get -y clean | tee -a $logfile
    echo apt-get -y autoremove | tee -a $logfile
    if [ "$whatif" = "0" ]; then
        apt-get -y clean | tee -a $logfile
        apt-get -y autoremove | tee -a $logfile
    fi
fi

# Update and do a full upgrade of remaining packages
echo apt-get -y update | tee -a $logfile
echo apt-get -y dist-upgrade | tee -a $logfile
if [ "$whatif" = "0" ]; then
    apt-get -y update | tee -a $logfile
    apt-get -y dist-upgrade | tee -a $logfile
fi

pkgs="
nginx
php-fpm
xdotools
unclutter
sed
chromium
"
# Install packages
for i in $pkgs; do
	echo apt-get -y install $i | tee -a $logfile
    if [ "$whatif" = "0" ]; then
    	apt-get -y install $i | tee -a $logfile
    fi
done

echo apt-get -y clean | tee -a $logfile
echo apt-get -y autoremove | tee -a $logfile
if [ "$whatif" = "0" ]; then
    apt-get -y clean | tee -a $logfile
    apt-get -y autoremove | tee -a $logfile
fi
