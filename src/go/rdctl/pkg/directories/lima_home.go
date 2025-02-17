/*
Copyright © 2022 SUSE LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package directories

import (
	"fmt"
	"os"
	"path"
	"runtime"
)

func SetupLimaHome() error {
	var candidatePath string
	if runtime.GOOS == "linux" {
		dataDir := os.Getenv("XDG_DATA_HOME")
		if dataDir == "" {
			homeDir, err := os.UserHomeDir()
			if err != nil {
				return err
			}
			dataDir = path.Join(homeDir, ".local", "share")
		}
		candidatePath = path.Join(dataDir, "rancher-desktop", "lima")
	} else {
		configDir, err := os.UserConfigDir()
		if err != nil {
			return err
		}
		candidatePath = path.Join(configDir, "rancher-desktop", "lima")
	}
	stat, err := os.Stat(candidatePath)
	if err != nil {
		return fmt.Errorf("can't find the lima-home directory at %q", candidatePath)
	}
	if !stat.Mode().IsDir() {
		return fmt.Errorf("path %q exists but isn't a directory", candidatePath)
	}
	os.Setenv("LIMA_HOME", candidatePath)
	return nil
}
