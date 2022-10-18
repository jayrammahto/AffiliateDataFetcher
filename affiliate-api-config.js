// module.exports = {
//   fk_details: {
//     // trackingId: "sushanthu",
//     // token: "d2fb0da1e6074e93aa1e918eac3343f0"
//     trackingId: 'adithyaad',
//     token: '24518b8a0fca445a8825b2ac27051fbd'
    
//   },
//   amz_details: {
//     temp: "temp"
//   },
//   strApi_details : {
//     server_url : 'http://localhost:1337',
//     full_access_auth_token: 'e19d09eab5a2ed22ea9b45303bcc89be98ec691e0b4ac3fb0c0bc87ee06c76afc0dce5303af6722962188c4d04b7477c0f6aec7ece092c22b8af25da5e86f9233ede54ba4b299094f94a1404aaeed2cd33f38de548b674f18bf67b7a5b0bdaf2750d9b151e66f56d6005d5173e4bd8181d2656bc592a8df61b1d2c7fc82cb11f'
//     // server_url : 'http://157.245.110.181:1337',
//     // full_access_auth_token: '6eaed0ccec341590acfa8d381ce215034a2f6534defc74758d2382f3a383793f5cfc0e48b13df03df945fb0e5241b34b8877605867cde51fb843b3afe2609f56a9bba40558617a941e087de6a1aa5ce2d9cfda1d1c578bae6fd073ef85b87e91a0db6f5a1e6a3b16069d610d0dcccea3da5f872d1cfae3824be6cbdd752de37c'
//   }
// }

module.exports = function () {
    var environment = process.env.NODE_ENV;
    console.log("DBG: environment: " + environment)
    var isProduction = environment === 'production'
    console.log("DBG: isProduction: " + isProduction)
    

    var result = {}
    result.fk_details = {
        // trackingId: "sushanthu",
        // token: "d2fb0da1e6074e93aa1e918eac3343f0"
        trackingId: 'adithyaad',
        token: '24518b8a0fca445a8825b2ac27051fbd'
      }
    result.amz_details = {
        temp: "temp"
      }

    if (!isProduction) {
        result.strApi_details = {
            server_url : 'http://localhost:1337',
            full_access_auth_token: 'e19d09eab5a2ed22ea9b45303bcc89be98ec691e0b4ac3fb0c0bc87ee06c76afc0dce5303af6722962188c4d04b7477c0f6aec7ece092c22b8af25da5e86f9233ede54ba4b299094f94a1404aaeed2cd33f38de548b674f18bf67b7a5b0bdaf2750d9b151e66f56d6005d5173e4bd8181d2656bc592a8df61b1d2c7fc82cb11f'
          }
      return result;
    } else {
        result.strApi_details = {
            server_url : 'http://157.245.110.181:1337',
            full_access_auth_token: '6eaed0ccec341590acfa8d381ce215034a2f6534defc74758d2382f3a383793f5cfc0e48b13df03df945fb0e5241b34b8877605867cde51fb843b3afe2609f56a9bba40558617a941e087de6a1aa5ce2d9cfda1d1c578bae6fd073ef85b87e91a0db6f5a1e6a3b16069d610d0dcccea3da5f872d1cfae3824be6cbdd752de37c'
          }
      return result;
    }
  }

