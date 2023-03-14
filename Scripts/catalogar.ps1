Import-Csv -Delimiter ';' -Path .\export.csv | 

ForEach-Object { 
    New-Item -ItemType File -Path $_.FinalPath -Force
}

Import-Csv -Delimiter ';' -Path .\export.csv | 

ForEach-Object { 
    Move-Item -Path $_.FullName -Destination $_.FinalPath -Force -Verbose
}


$receivedDirectory = "M:\OPERACION DIARIA 9\9.1. CATALOGACION\Historico Sofia\Eq. Sofia\Andres\1 test"

        Import-Csv -Delimiter '|' -Path "$($receivedDirectory)\export.csv" | 
        ForEach-Object {
            if ($_.FinalPath -ne "") {
                New-Item -ItemType "directory" -Path "$($receivedDirectory)$($_.FinalPath)"
            }
        } | 
        Format-Table

        $movedList = @()
        
        Import-Csv -Delimiter '|' -Path "$($receivedDirectory)\export.csv" | 
        ForEach-Object { 
            if ($_.FinalPath -ne "") {
                $initialName = $_.Name.Split(" >> ")
                
                $movedItem = Copy-Item -Path $_.FullName -Destination "$($receivedDirectory)$($_.FinalPath)$($_.NewName)" -PassThru
                $movedItem
                if ($movedItem.Length -eq $_.Length) {
                    $fileCheck = "OK"
                    $objectName = $movedItem.FullName
                    Remove-Item -Path $_.FullName -Verbose
                    if (Test-Path -Path $_.FullName -PathType leaf) {
                        $fileCheck = "verificar-eliminacion"
                    }
                    
                }
                else{
                    $fileCheck = "error-al-copiar"
                    $objectName = "$($_.FullName)"
                }
                $movedITemArray = [pscustomobject]@{Check=$fileCheck; Length=$movedItem.Length; Name=$initialName[0]; FullName=$objectName}
                $movedList += $movedITemArray
            }
        } 
        $movedList | Format-Table -AutoSize
        $movedList |  ConvertTo-Json | 
        Out-File -LiteralPath "$($receivedDirectory)\verify.txt" -Encoding utf8
 
    



        Get-ChildItem -LiteralPath "${receivedDirectory}" -Exclude directory.csv -Attributes !Directory -Recurse . | 
        Sort-Object fullname | 
        Select-Object FullName, name, Category, Radicado, Date, ${timeVal}, Organo, Sala, Reserved, Virtual, Consecutivo, NewName, NameLength, Extension, Length, FinalPath | 
            Export-Csv -Force -Delimiter '|' -Encoding UTF8 -LiteralPath "${receivedDirectory}\\directory.csv"
