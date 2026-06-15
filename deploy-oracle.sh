#!/bin/bash

# Update and install Docker
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-compose

# Open Oracle Cloud Firewall (iptables) for ports 5051 and 5432
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 5051 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 5432 -j ACCEPT
sudo netfilter-persistent save

echo "Setup complete. You can now run: docker-compose up -d"
