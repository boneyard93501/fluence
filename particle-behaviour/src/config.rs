/*
 * Copyright 2020 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

use particle_actors::VmPoolConfig;
use particle_dht::DHTConfig;
use particle_protocol::ProtocolConfig;
use particle_services::ServicesConfig;

use config_utils::{create_dirs, to_peer_id};
use server_config::KademliaConfig;

use crate::identify::NodeInfo;
use libp2p::core::Multiaddr;
use libp2p::{identity::ed25519, PeerId};
use std::{collections::HashMap, io, path::PathBuf};

pub struct ParticleConfig {
    pub protocol_config: ProtocolConfig,
    pub current_peer_id: PeerId,
    pub services_base_dir: PathBuf,
    pub services_envs: HashMap<Vec<u8>, Vec<u8>>,
    pub stepper_base_dir: PathBuf,
    /// Path to aquamarine.wasm
    pub air_interpreter: PathBuf,
    pub key_pair: ed25519::Keypair,
    pub stepper_pool_size: usize,
    pub node_info: NodeInfo,
    pub kad_config: KademliaConfig,
}

impl ParticleConfig {
    pub fn new(
        protocol_config: ProtocolConfig,
        current_peer_id: PeerId,
        services_base_dir: PathBuf,
        services_envs: HashMap<Vec<u8>, Vec<u8>>,
        stepper_base_dir: PathBuf,
        air_interpreter: PathBuf,
        key_pair: ed25519::Keypair,
        stepper_pool_size: usize,
        external_addresses: Vec<Multiaddr>,
        kad_config: KademliaConfig,
    ) -> Self {
        Self {
            protocol_config,
            current_peer_id,
            services_base_dir,
            services_envs,
            stepper_base_dir,
            air_interpreter,
            key_pair,
            stepper_pool_size,
            kad_config,
            node_info: NodeInfo { external_addresses },
        }
    }

    pub fn actor_config(&self) -> io::Result<VmPoolConfig> {
        VmPoolConfig::new(
            self.current_peer_id.clone(),
            self.stepper_base_dir.clone(),
            self.air_interpreter.clone(),
            self.stepper_pool_size,
        )
    }

    pub fn services_config(&self) -> io::Result<ServicesConfig> {
        ServicesConfig::new(
            self.current_peer_id.to_string(),
            self.services_base_dir.clone(),
            self.services_envs.clone(),
        )
    }

    /// Creates and returns path for app service modules directory
    pub fn modules_dir(&self) -> io::Result<PathBuf> {
        let path = self.services_base_dir.join("modules");
        create_dirs(&[&path])?;

        Ok(path)
    }

    /// Creates and returns path for app service blueprint directory
    pub fn blueprint_dir(&self) -> io::Result<PathBuf> {
        let path = self.services_base_dir.join("blueprint");
        create_dirs(&[&path])?;

        Ok(path)
    }

    pub fn dht_config(&self) -> DHTConfig {
        DHTConfig {
            peer_id: to_peer_id(&self.key_pair),
            keypair: self.key_pair.clone(),
            kad_config: self.kad_config.clone(),
        }
    }
}
