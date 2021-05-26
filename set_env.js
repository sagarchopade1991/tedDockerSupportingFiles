const { exec } = require('child_process');
const replace = require('replace-in-file');
const args = process.argv.slice(2);

exec(
  `az storage account keys list -g ${args[0]} -n ${args[1]}`,
  (error, stdout, stderr) => {
    const keyObj = JSON.parse(stdout);
    const azureStorageAccountAccessKey = keyObj[0].value;
    replace.sync({
      files: './.env',
      from: 'azureStorageAccountAccessKey=',
      to: `azureStorageAccountAccessKey=${azureStorageAccountAccessKey.toString()}`
    });
  }
);

exec(
  `az iot hub show --query properties.eventHubEndpoints.events.path --name ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: './.env',
      from: 'eventHubsCompatiblePath=',
      to: `eventHubsCompatiblePath=${stdout.slice(1, stdout.length - 2)}`
    });
  }
);

exec(
  `az iot hub show --query properties.eventHubEndpoints.events.endpoint --name ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: './.env',
      from: 'eventHubsCompatibleEndpoint=',
      to: `eventHubsCompatibleEndpoint=${stdout.slice(1, stdout.length - 3)}`
    });
  }
);

exec(
  `az iot hub policy show --name service --query primaryKey --hub-name ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: './.env',
      from: 'iotHubSasKey=',
      to: `iotHubSasKey=${stdout.slice(1, stdout.length - 2)}`
    });
  }
);

exec(
  `az iot hub device-identity connection-string show -d ${args[3]} -n ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: './.env',
      from: 'deviceConnectionString=',
      to: `deviceConnectionString=${JSON.parse(stdout).connectionString}`
    });
  }
);

exec(
  `az cosmosdb keys list --type connection-strings -g ${args[0]} -n ${args[4]}`,
  (error, stdout, stderr) => {
    const jsonObj = JSON.parse(stdout);
    replace.sync({
      files: './.env',
      from: 'cosmosConnectionString=',
      to: `cosmosConnectionString=${jsonObj.connectionStrings[0].connectionString}`
    });
  }
);

exec(
  `az vm show -d -g ${args[0]} -n ${args[5]} --query publicIps -o tsv`,
  (error, stdout, stderr) => {
    var url = `http://${stdout}`;
    replace.sync({
      files: './.env',
      from: 'API_URL=',
      to: `API_URL=${url}`
    });
  }
);

replace.sync({
  files: './.env',
  from: 'azureStorageAccountName=',
  to: `azureStorageAccountName=${args[1]}`
});
