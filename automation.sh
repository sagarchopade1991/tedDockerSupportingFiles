#!/bin/bash

# accept input
echo "Enter Resource Group Name:"
read resource_group
echo "Enter Storage Account Name:"
read storage_acc
echo "Enter IoT Hub Name:"
read iot_hub
echo "Enter IoT-Device Name(New Device):"
read iot_device_name
echo "Enter Cosmos DB Account Name:"
read cosmos_acc
echo "Enter Virtual Machine Name:"
read vm_name

# install docker 
echo "Installing Docker-Compose"
apt-get update
apt-get install apt-transport-https \
                ca-certificates \
                curl gnupg \
                lsb-release -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg -y
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io -y

curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose

# installing azure cli
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
echo "***************************************************"
echo "***************************************************"
echo "Please copy the link and paste it in the browser"
echo "***************************************************"
echo "***************************************************"
az login
# add extention to az
az extension add --name azure-iot

# container registry login 
az acr login --name iotsharedcontainerregistry

# create iot device 
az iot hub device-identity create -n $iot_hub -d $iot_device_name --ee false

# create .env and copy content from env.temp
true > .env && cp env.temp .env

# install nodejs
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt-get install -y nodejs build-essential

# install npm packages and run nodejs app to set environment variables

npm install && node set_env.js $resource_group $storage_acc $iot_hub $iot_device_name $cosmos_acc $vm_name

docker-compose up -d

