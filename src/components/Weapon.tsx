import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { WeaponType } from '../types'

interface WeaponProps {
  currentWeapon: WeaponType
  isSwapping: boolean
  isShooting: boolean
  onShoot: (position: THREE.Vector3, direction: THREE.Vector3) => void
  muzzleFlashRef: React.MutableRefObject<THREE.Mesh | null>
}

export function Weapon({ currentWeapon, isSwapping, isShooting, onShoot, muzzleFlashRef }: WeaponProps) {
  const { camera } = useThree()
  const weaponRef = useRef<THREE.Group>(null)
  const swapAnimationRef = useRef<number>(0)
  const recoilRef = useRef<number>(0)
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false)

  useEffect(() => {
    if (weaponRef.current) {
      weaponRef.current.clear()
      const newWeapon = createWeaponGeometry(currentWeapon)
      weaponRef.current.add(newWeapon)

      const muzzleFlash = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
      )
      muzzleFlash.position.copy(getMuzzlePosition(currentWeapon))
      muzzleFlash.visible = false
      muzzleFlashRef.current = muzzleFlash
      weaponRef.current.add(muzzleFlash)
    }
  }, [currentWeapon, muzzleFlashRef])

  useEffect(() => {
    if (isShooting) {
      recoilRef.current = 0.2
      setShowMuzzleFlash(true)
      setTimeout(() => setShowMuzzleFlash(false), 50)
      if (weaponRef.current && muzzleFlashRef.current) {
        const muzzlePosition = new THREE.Vector3()
        muzzleFlashRef.current.getWorldPosition(muzzlePosition)
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
        onShoot(muzzlePosition, direction)
      }
    }
  }, [isShooting, camera, onShoot])

  useFrame((_, delta) => {
    if (weaponRef.current && muzzleFlashRef.current) {
      // Adjusted weapon offset for proper positioning
      const weaponOffset = new THREE.Vector3(0.4, -0.3, -0.7)
      const rotatedOffset = weaponOffset.clone().applyQuaternion(camera.quaternion)
      const weaponPosition = camera.position.clone().add(rotatedOffset)
      weaponRef.current.position.lerp(weaponPosition, 0.1)
      weaponRef.current.quaternion.copy(camera.quaternion)

      if (isSwapping) {
        swapAnimationRef.current += delta * 4
        const t = Math.min(swapAnimationRef.current, 1)
        const y = Math.sin(t * Math.PI) * 0.5
        const scale = 1 + Math.sin(t * Math.PI * 2) * 0.2
        weaponRef.current.position.y -= y
        weaponRef.current.rotation.x -= y * 2
        weaponRef.current.scale.setScalar(scale)
      } else {
        weaponRef.current.scale.setScalar(1)
      }

      if (recoilRef.current > 0) {
        const recoilAmount = recoilRef.current
        const recoilOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          recoilAmount * 0.1
        )
        weaponRef.current.position.add(recoilOffset)
        weaponRef.current.rotation.x -= recoilAmount * 0.3
        weaponRef.current.rotation.y += (Math.random() - 0.5) * 0.02 * recoilAmount
        recoilRef.current = Math.max(0, recoilRef.current - delta * 4)
      }

      if (muzzleFlashRef.current) {
        muzzleFlashRef.current.visible = showMuzzleFlash
      }
    }
  })

  return <group ref={weaponRef}></group>
}

function createWeaponGeometry(type: WeaponType): THREE.Group {
  const group = new THREE.Group()

  const scaleFactor = 3  // Increase overall size for better visibility 

  // Common parts
  const grip = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.15 * scaleFactor, 0.05 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'brown' })
  )
  grip.position.set(0, -0.1 * scaleFactor, -0.05 * scaleFactor)
  group.add(grip)

  const trigger = new THREE.Mesh(
    new THREE.BoxGeometry(0.01 * scaleFactor, 0.02 * scaleFactor, 0.01 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  trigger.position.set(0, -0.05 * scaleFactor, -0.02 * scaleFactor)
  group.add(trigger)

  const mainBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.05 * scaleFactor, 0.3 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'gray' })
  )
  mainBody.position.set(0, 0, 0.05 * scaleFactor)
  group.add(mainBody)

  // Weapon-specific parts
  switch (type) {
    case 'Pistol':
      addPistolDetails(group, scaleFactor)
      break
    case 'Rifle':
      addRifleDetails(group, scaleFactor)
      break
    case 'Shotgun':
      addShotgunDetails(group, scaleFactor)
      break
    case 'Sniper':
      addSniperDetails(group, scaleFactor)
      break
    case 'SMG':
      addSMGDetails(group, scaleFactor)
      break
    case 'RocketLauncher':
      addRocketLauncherDetails(group, scaleFactor)
      break
    case 'LaserGun':
      addLaserGunDetails(group, scaleFactor)
      break
    case 'Crossbow':
      addCrossbowDetails(group, scaleFactor)
      break
    case 'Flamethrower':
      addFlamethrowerDetails(group, scaleFactor)
      break
    case 'GrenadeLauncher':
      addGrenadeLauncherDetails(group, scaleFactor)
      break
    default:
      break
  }

  return group
}

function addPistolDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007 * scaleFactor, 0.007 * scaleFactor, 0.2 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'darkgray' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.15 * scaleFactor)
  group.add(barrel)

  const slide = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.02 * scaleFactor, 0.15 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  slide.position.set(0, 0.025 * scaleFactor, 0.075 * scaleFactor)
  group.add(slide)
}

function addRifleDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008 * scaleFactor, 0.008 * scaleFactor, 0.5 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.3 * scaleFactor)
  group.add(barrel)

  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.1 * scaleFactor, 0.2 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'brown' })
  )
  stock.position.set(0, -0.025 * scaleFactor, -0.15 * scaleFactor)
  group.add(stock)

  const magazine = new THREE.Mesh(
    new THREE.BoxGeometry(0.02 * scaleFactor, 0.05 * scaleFactor, 0.05 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  magazine.position.set(0, -0.05 * scaleFactor, 0)
  group.add(magazine)

  const scope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01 * scaleFactor, 0.01 * scaleFactor, 0.15 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  scope.rotation.z = Math.PI / 2
  scope.position.set(0, 0.05 * scaleFactor, 0.1 * scaleFactor)
  group.add(scope)
}

function addShotgunDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01 * scaleFactor, 0.01 * scaleFactor, 0.4 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'darkgray' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.25 * scaleFactor)
  group.add(barrel)

  const pump = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.02 * scaleFactor, 0.1 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  pump.position.set(0, -0.015 * scaleFactor, 0.1 * scaleFactor)
  group.add(pump)

  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.1 * scaleFactor, 0.15 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'brown' })
  )
  stock.position.set(0, -0.025 * scaleFactor, -0.15 * scaleFactor)
  group.add(stock)
}

function addSniperDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005 * scaleFactor, 0.005 * scaleFactor, 0.6 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.35 * scaleFactor)
  group.add(barrel)

  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.1 * scaleFactor, 0.25 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'brown' })
  )
  stock.position.set(0, -0.025 * scaleFactor, -0.2 * scaleFactor)
  group.add(stock)

  const scope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012 * scaleFactor, 0.012 * scaleFactor, 0.2 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  scope.rotation.z = Math.PI / 2
  scope.position.set(0, 0.06 * scaleFactor, 0.1 * scaleFactor)
  group.add(scope)

  // Bipod legs
  const bipodLeg1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002 * scaleFactor, 0.002 * scaleFactor, 0.1 * scaleFactor, 8),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  bipodLeg1.rotation.x = Math.PI / 2
  bipodLeg1.rotation.z = Math.PI / 6
  bipodLeg1.position.set(0.01 * scaleFactor, -0.05 * scaleFactor, 0.2 * scaleFactor)
  group.add(bipodLeg1)

  const bipodLeg2 = bipodLeg1.clone()
  bipodLeg2.rotation.z = -Math.PI / 6
  bipodLeg2.position.set(-0.01 * scaleFactor, -0.05 * scaleFactor, 0.2 * scaleFactor)
  group.add(bipodLeg2)
}

function addSMGDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005 * scaleFactor, 0.005 * scaleFactor, 0.25 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.15 * scaleFactor)
  group.add(barrel)

  const magazine = new THREE.Mesh(
    new THREE.BoxGeometry(0.015 * scaleFactor, 0.05 * scaleFactor, 0.03 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  magazine.position.set(0, -0.05 * scaleFactor, -0.02 * scaleFactor)
  group.add(magazine)

  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(0.04 * scaleFactor, 0.04 * scaleFactor, 0.1 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  stock.position.set(0, -0.01 * scaleFactor, -0.15 * scaleFactor)
  group.add(stock)
}

function addRocketLauncherDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02 * scaleFactor, 0.02 * scaleFactor, 0.5 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'green' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.3 * scaleFactor)
  group.add(barrel)

  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.02 * scaleFactor, 0.05 * scaleFactor, 0.04 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  handle.position.set(0, -0.05 * scaleFactor, -0.05 * scaleFactor)
  group.add(handle)
}

function addLaserGunDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006 * scaleFactor, 0.006 * scaleFactor, 0.2 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'blue' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.15 * scaleFactor)
  group.add(barrel)

  const energyCell = new THREE.Mesh(
    new THREE.BoxGeometry(0.03 * scaleFactor, 0.04 * scaleFactor, 0.06 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'cyan' })
  )
  energyCell.position.set(0, -0.02 * scaleFactor, -0.05 * scaleFactor)
  group.add(energyCell)
}

function addCrossbowDetails(group: THREE.Group, scaleFactor: number) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * scaleFactor, 0.04 * scaleFactor, 0.2 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'brown' })
  )
  body.position.set(0, 0, 0)
  group.add(body)

  const bow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3 * scaleFactor, 0.02 * scaleFactor, 0.02 * scaleFactor),
    new THREE.MeshStandardMaterial({ color: 'gray' })
  )
  bow.position.set(0, 0, 0.1 * scaleFactor)
  group.add(bow)

  const string = new THREE.Mesh(
    new THREE.CylinderGeometry(0.001 * scaleFactor, 0.001 * scaleFactor, 0.3 * scaleFactor, 8),
    new THREE.MeshStandardMaterial({ color: 'black' })
  )
  string.rotation.z = Math.PI / 2
  string.position.set(0, 0, 0.1 * scaleFactor)
  group.add(string)
}

function addFlamethrowerDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005 * scaleFactor, 0.005 * scaleFactor, 0.25 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'red' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.15 * scaleFactor)
  group.add(barrel)

  const fuelTank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03 * scaleFactor, 0.03 * scaleFactor, 0.15 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'orange' })
  )
  fuelTank.rotation.z = Math.PI / 2
  fuelTank.position.set(0, -0.05 * scaleFactor, -0.1 * scaleFactor)
  group.add(fuelTank)
}

function addGrenadeLauncherDetails(group: THREE.Group, scaleFactor: number) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012 * scaleFactor, 0.012 * scaleFactor, 0.3 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'darkgreen' })
  )
  barrel.rotation.z = Math.PI / 2
  barrel.position.set(0, 0, 0.2 * scaleFactor)
  group.add(barrel)

  const drumMagazine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03 * scaleFactor, 0.03 * scaleFactor, 0.05 * scaleFactor, 16),
    new THREE.MeshStandardMaterial({ color: 'gray' })
  )
  drumMagazine.rotation.x = Math.PI / 2
  drumMagazine.position.set(0, -0.02 * scaleFactor, -0.05 * scaleFactor)
  group.add(drumMagazine)
}

function getMuzzlePosition(type: WeaponType): THREE.Vector3 {
  const scaleFactor = 3
  switch (type) {
    case 'Pistol':
      return new THREE.Vector3(0, 0, 0.2 * scaleFactor)
    case 'Rifle':
      return new THREE.Vector3(0, 0, 0.4 * scaleFactor)
    case 'Shotgun':
      return new THREE.Vector3(0, 0, 0.3 * scaleFactor)
    case 'Sniper':
      return new THREE.Vector3(0, 0, 0.5 * scaleFactor)
    case 'SMG':
      return new THREE.Vector3(0, 0, 0.25 * scaleFactor)
    case 'RocketLauncher':
      return new THREE.Vector3(0, 0, 0.5 * scaleFactor)
    case 'LaserGun':
      return new THREE.Vector3(0, 0, 0.25 * scaleFactor)
    case 'Crossbow':
      return new THREE.Vector3(0, 0, 0.2 * scaleFactor)
    case 'Flamethrower':
      return new THREE.Vector3(0, 0, 0.25 * scaleFactor)
    case 'GrenadeLauncher':
      return new THREE.Vector3(0, 0, 0.3 * scaleFactor)
    default:
      return new THREE.Vector3(0, 0, 0)
  }
}
