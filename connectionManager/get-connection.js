function connectionName(node) {
	if(node.connectionNode) {
		try{
			return ( node.connectionNode.name||node.connectionNode.id );
		} catch(e) {
			return "*** error: "+e;
		}
	}
	return "*** no connection";
}
module.exports = function(RED) {
    function GetConnectionNode(n) {
        RED.nodes.createNode(this,n);
        var node=Object.assign(this,n);
        RED.events.on("nodes-started",function() {
            node.connectionNode=RED.nodes.getNode(node.connection);
            if (!node.connectionNode) {
    			node.error("Connection not found "+node.connection);
           		node.status({ fill: 'red', shape: 'ring', text: "Connection not found" });
           		return;
            }
       		node.status({ fill: 'green', shape: 'ring', text: "Connection to "+ connectionName(node) });
        });
        var failedLastTime=false;
        node.on('input', function (msg) {
        	node.connectionNode.setMsg.apply(node,[msg,
        		function() {
    				node.send(msg);
    				if(failedLastTime) {
    		       		node.status({ fill: 'green', shape: 'ring', text: "Connection to "+ connectionName(node) });
    		       		var failedLastTime=false;
    				}
        		},
        		function(e) {
        			node.status({ fill: 'red', shape: 'ring', text: "Connecting to "+connectionName(node) });
        			node.error("get connection failed: "+e);
        			msg.error=e;
        			node.send([null,msg]);
		       		var failedLastTime=true;
        		}
        	]);
        });
    }
    RED.nodes.registerType("Get Connection",GetConnectionNode);
};