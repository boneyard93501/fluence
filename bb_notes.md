# Notes

cmd line:
cargo +nightly build   ok


Makefile:

make defaults -- develop  or change to : make build-release, build-develop ?



test:

long running, expensive tests -- `#[test] #[ignore]` for long running tests ?
Running target/debug/deps/builtin-e06b87521026e2b4

running 1 test
test identify ... test identify has been running for over 60 seconds
test identify ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 305.00s

     Running target/debug/deps/echo_particle-75dae01995e0fc3a


Running target/debug/deps/kademlia-c8b974cdfbf13419

running 1 test
test neighborhood ... test neighborhood has been running for over 60 seconds
test neighborhood ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 336.36s


Running target/debug/deps/local_vm-bb3955018d047395

running 1 test
test make ... test make has been running for over 60 seconds
test make ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 194.76s

     Running target/debug/deps/network_explore-0c0afc8568b44cb3


Running target/debug/deps/network_explore-0c0afc8568b44cb3

running 5 tests
test explore_services ... test explore_services has been running for over 60 seconds
test get_interfaces ... test get_interfaces has been running for over 60 seconds
test get_blueprints ... test get_blueprints has been running for over 60 seconds
test get_modules ... test get_modules has been running for over 60 seconds
test explore_services_fixed ... test explore_services_fixed has been running for over 60 seconds

thread '<unknown>' has overflowed its stack
fatal runtime error: stack overflow
error: test failed, to rerun pass '-p particle-server --test network_explore'

Caused by:
  process didn't exit successfully: `/Users/bebo/localdev/fluencelabs/fluence/target/debug/deps/network_explore-0c0afc8568b44cb3` (signal: 6, SIGABRT: process abort signal)
make: *** [test] Error 101




cross-build:
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1) % make cross-build
cargo update -p libp2p
error: package ID specification `libp2p` matched no packages
make: *** [cross-build] Error 101

also (osx):
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1…) % cross build --release --target x86_64-unknown-linux-gnu
zsh: command not found: cross
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1…) %

so `cargo install cross --force` is needed (https://github.com/rust-embedded/cross) but of course not working.  remember it's a pita involving musil ...  i'll have to get back to that (https://hackernoon.com/cross-compiling-rust-on-macos-to-run-as-a-unikernel-ff1w3ypi)






docker
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1) % make docker
cargo +nightly update -p libp2p
error: package ID specification `libp2p` matched no packages
make: *** [cross-build] Error 101
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1) %

containers
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1) % make containers
docker build --build-arg local_exe=./target/x86_64-unknown-linux-gnu/release/particle-server --build-arg exe=particle-server -t fluencelabs/fluence:bb-docs .
Sending build context to Docker daemon   20.7MB
Step 1/10 : from bitnami/minideb:latest
latest: Pulling from bitnami/minideb
ff7c165d667c: Pull complete
Digest: sha256:0071b4efc7aae20b69dab23da9553a5911fa23cdf9fb4cf131bae5f5cd1bebec
Status: Downloaded newer image for bitnami/minideb:latest
 ---> 2eefb5f05cae
Step 2/10 : ARG exe=
 ---> Running in 1af54be0df67
Removing intermediate container 1af54be0df67
 ---> 45d232460369
Step 3/10 : ARG config=
 ---> Running in 8f0a2c6fd6d0
Removing intermediate container 8f0a2c6fd6d0
 ---> 3ba6824c675c
Step 4/10 : copy $exe /fluence
COPY failed: file not found in build context or excluded by .dockerignore: stat particle-server: file does not exist
make: *** [containers] Error 1
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1) %



push
want that in user-facing makefile ?



server

mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1…) % make server
cargo +nightly run -p particle-server -- -b /ip4/207.154.232.92/tcp/7777
    Finished dev [unoptimized + debuginfo] target(s) in 0.29s
     Running `target/debug/particle-server -b /ip4/207.154.232.92/tcp/7777`
Error: Config wasn't found at .fluence/Config.toml

Caused by:
    No such file or directory (os error 2)
make: *** [server] Error 1
mbp16~/localdev/fluencelabs/fluence(bb-docs|✚1…) %

when i copy https://github.com/fluencelabs/fluence/blob/master/deploy/Config.default.toml#L21-L24
into (root)  ./fluence/Config.toml
things look good  


running the server is kiiling my 2.4 GHz 8-Core Intel Core i9
```
Processes: 478 total, 5 running, 473 sleeping, 2796 threads                                                                       16:50:33
Load Avg: 19.64, 19.39, 14.80  CPU usage: 97.40% user, 2.24% sys, 0.35% idle  SharedLibs: 524M resident, 77M data, 145M linkedit.
MemRegions: 210475 total, 11G resident, 289M private, 6265M shared. PhysMem: 35G used (4462M wired), 29G unused.
VM: 3149G vsize, 1993M framework vsize, 0(0) swapins, 0(0) swapouts. Networks: packets: 2237023/3087M in, 3782352/493M out.
Disks: 1338802/21G read, 1060005/50G written.

PID    COMMAND      %CPU   TIME     #TH    #WQ  #PORT MEM    PURG  CMPR PGRP  PPID  STATE    BOOSTS         %CPU_ME %CPU_OTHRS UID
63565  particle-ser 1525.4 02:30:05 70/16  0    79    1230M+ 0B    0B   63559 63559 running  *0[1]          0.00000 0.00000    501
```  
that goes on for a long time and then it settles.

also, when i'm running the server, my ip doesn't show up in the dashabord. it should, right ?


different question: flunece-client ...
i have the local server: 
./target/debug/particle-server -b /ip4/0.0.0.0/tcp/7777 -t 7777 -w 9999

and the client
./fluence-client /ip4/0.0.0.0/tcp/7777


both up and running ... now wwhat?






## README.md


docker 
docker run -d --name fluence -v $PWD:/.fluence -e RUST_LOG="info" -p 7777 -p 9999 fluencelabs/fluence

mbp16~/localdev/fluencelabs/fluence(bb-docs|●2✚1…) % docker logs 6792fbf77a4a
[2021-01-14T00:18:06.293494Z INFO  server_config::fluence_config] Loading config from .fluence/Config.toml
Error: Config wasn't found at .fluence/Config.toml

Caused by:
    No such file or directory (os error 2)

Stack backtrace:
   0: anyhow::context::<impl anyhow::Context<T,E> for core::result::Result<T,E>>::context
   1: server_config::fluence_config::load_config
   2: particle_server::main
   3: std::sys_common::backtrace::__rust_begin_short_backtrace
   4: std::rt::lang_start::{{closure}}
   5: core::ops::function::impls::<impl core::ops::function::FnOnce<A> for &F>::call_once
             at ./rustc/fa416394275d2468d104b8f72ac31b1ddf7ee52e/library/core/src/ops/function.rs:259:13
      std::panicking::try::do_call
             at ./rustc/fa416394275d2468d104b8f72ac31b1ddf7ee52e/library/std/src/panicking.rs:379:40
      std::panicking::try
             at ./rustc/fa416394275d2468d104b8f72ac31b1ddf7ee52e/library/std/src/panicking.rs:343:19
      std::panic::catch_unwind
             at ./rustc/fa416394275d2468d104b8f72ac31b1ddf7ee52e/library/std/src/panic.rs:396:14
      std::rt::lang_start_internal
             at ./rustc/fa416394275d2468d104b8f72ac31b1ddf7ee52e/library/std/src/rt.rs:51:25
   6: main
   7: __libc_start_main
   8: _start

but: 
mbp16~/localdev/fluencelabs/fluence(bb-docs|●2✚1…) % ls .fluence
Config.toml	certificates	secret_key	serv



in the Dockerfile we got:

```
from bitnami/minideb:latest

ARG exe=
ARG config=

copy $exe /fluence
run chmod +x /fluence

copy $config /.fluence/Config.toml

volume /.fluence

env RUST_LOG="info,aquamarine=warn,tokio_threadpool=info,tokio_reactor=info,mio=info,tokio_io=info,soketto=info,yamux=info,multistream_select=info,libp2p_secio=info,libp2p_websocket::framed=info,libp2p_ping=info,libp2p_core::upgrade::apply=info,libp2p_kad::kbucket=info,cranelift_codegen=info,wasmer_wasi=info,cranelift_codegen=info,wasmer_wasi=info"
env RUST_BACKTRACE="1"

entrypoint ["/fluence"]
```  

when the docker hub version is built, is the (config=) .fluence/Config.toml  param provided ?


fix this:
```
make build

./target/release/fluence -t 7777 -w 9999
```
to particle-server