# PiFrame Setup
_**NOTE:** I used a Raspberry Pi 3 Model A+ and Raspbian OS for my build._

## Get the installation script
Copy the install script like the Downloads folder:
```shell
cd ~/Downloads
wget https://raw.githubusercontent.com/natefish/PiFrame/aed408591d27f941ad0941c3caefbe4fc6a5bc59/setup.sh
```
## Running the installation script
From terminal, run the setup script you just coppied (used the flags as desired):
```shell
#setup.sh [[-i ] [-w] [-l <path>]] | [-h]
#  -l|--log          Log path. Default is './setup.log'
#  -i|--installonly  Do not uninstall programs not used by PiFrame.
#  -w|--whatif       See the list of commands that will be run without
#                    actually running them.
#  -h|--help         Show help.


bash ./setup.sh
```
## Configure the settings file
There are serveral configurable settings. To change them, edit settings.txt:
```shell
sudo nano /var/PiFrame/www/settings.txt
```

## Additional manual settings
### Increase the default swap size for better performance
To increase the default swap size, edit dphys-swapfile:
```shell
sudo nano /etc/dphys-swapfile
```
Then change the CONF_SWAPSIZE to 512 or 1024, eg:
```shell
CONF_SWAPSIZE=512
```
### Set the screen to auto turn on and auto turn off
Set the screen to automatically turn on or off at a certain time:
```shell
crontab -e
```
The set the start and end jobs (mm HH * * * tells the cron job to run every day at a certain time)
```shell
30 5 * * * vcgencmd display_power 1
30 22 * * * vcgencmd display_power 0
```

### If you appreciate this work or find it useful, consider becoming a Patron or donating
https://www.patreon.com/reinhanc
https://paypal.me/NReinhard