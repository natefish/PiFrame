whatif=0
cleanup=1
logfile="./setup.log"

if (( $EUID != 0 )); then
    echo "Please run as root"
    exit
fi

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

usage()
{
    echo "usage: setup [[-i ] [-w]] | [-h]]"
    echo ""
    echo "-l|--log          Log path. Default is './setup.log'"
    echo "-i|--installonly  Do not uninstall programs not used by PiFrame."
    echo "-w|--whatif       See the list of commands that will be run without actually running them."
    echo "-h|--help         Show help."
}

echo $(date +"%x %r %Z") | tee $logfile
echo "installonly=$cleanup" | tee -a $logfile
echo "whatif=$whatif" | tee -a $logfile

if [ "$cleanup" = "1"]; then
    # Unneeded packages
    pkgs="
    idle python3-pygame python-pygame python-tk
    idle3 python3-tk
    python3-rpi.gpio
    python-serial python3-serial
    python-picamera python3-picamera
    debian-reference-en dillo x2x
    scratch nuscratch
    raspberrypi-ui-mods
    timidity
    smartsim penguinspuzzle
    pistore
    sonic-pi
    python3-numpy
    python3-pifacecommon python3-pifacedigitalio python3-pifacedigital-scratch-handler python-pifacecommon python-pifacedigitalio
    oracle-java8-jdk
    minecraft-pi python-minecraftpi
    wolfram-engine
    "

    # Remove packages
    for i in $pkgs; do
        echo apt-get -y remove --purge $i | tee -a $logfile
        if [ "$whatif" = "0"]; then
            apt-get -y remove --purge $i | tee -a $logfile
        fi
    done

    # Remove automatically installed dependency packages
    echo apt-get -y clean | tee -a $logfile
    echo apt-get -y autoremove | tee -a $logfile
    if [ "$whatif" = "0"]; then
        apt-get -y clean | tee -a $logfile
        apt-get -y autoremove | tee -a $logfile
    fi
fi

# Update and do a full upgrade of remaining packages
echo apt-get -y update | tee -a $logfile
echo apt-get -y dist-upgrade | tee -a $logfile
if [ "$whatif" = "0"]; then
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
    if [ "$whatif" = "0"]; then
    	apt-get -y install $i | tee -a $logfile
    fi
done

echo apt-get -y clean | tee -a $logfile
echo apt-get -y autoremove | tee -a $logfile
if [ "$whatif" = "0"]; then
    apt-get -y clean | tee -a $logfile
    apt-get -y autoremove | tee -a $logfile
fi
