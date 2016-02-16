# get-network-traffic-data

A CasperJS based script to collect various data about the network traffic traffic for a given list of urls. 
Outputs it's result into a json file. Requires a config file to work which has two keys (urls and the destination for the output_file).

```
{
	"urls":[
		"<url>",
    "<some other url>
	],
	"output_file":"output.json"
}
```

