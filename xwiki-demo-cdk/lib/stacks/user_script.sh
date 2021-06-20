#! /bin/bash
# become root user

sudo yum -q -y install java-1.8.0-openjdk
sudo yum -q -y install unzip
mkdir xwikihome
wget -q -O xwiki_packer.zip https://nexus.xwiki.org/nexus/content/groups/public/org/xwiki/platform/xwiki-platform-distribution-flavor-jetty-hsqldb/13.1/xwiki-platform-distribution-flavor-jetty-hsqldb-13.1.zip
unzip -q xwiki_packer.zip -d /home/ec2-user/xwikihome



