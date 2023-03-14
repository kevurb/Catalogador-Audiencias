Get-ChildItem -Exclude ".\directory.csv"  -Recurse . | 
Sort-Object fullname | Select-Object FullName, @{
    name='Name'
    expr={$_.Name, $_.LastWriteTime -join ' | Modified: '}
}, Extension, Length, Radicado, Date, Time, Organo, Sala, Reserved, Virtual, Consecutivo, NewName, NameLength, Category, FinalPath | 
Export-Csv -Force -Delimiter ';' -Encoding UTF8 -Path .\directory.csv

//verificar

function Format-Json([Parameter(Mandatory, ValueFromPipeline)][String] $json) {
    $indent = 0;
    ($json -Split '\n' |
    % {
        if ($_ -match '[\}\]]') {
        # This line contains  ] or }, decrement the indentation level
        $indent--
        }
        $line = (' ' * $indent * 2) + $_.TrimStart().Replace(':  ', ': ')
        if ($_ -match '[\{\[]') {
        # This line contains [ or {, increment the indentation level
        $indent++
        }
        $line
    }) -Join "`n"
} 

Get-ChildItem -LiteralPath "." -Exclude directory.csv  -Attributes !Directory -Recurse . | 
Select-Object Name, @{
    Name="lengthOfName";
    Expression={$_.FullName.Length}
} | 
Where-Object {$_.lengthOfName -ge 100} |
Sort-Object lengthOfName -Descending | 
ConvertTo-Json | Format-Json |
Out-File -FilePath ".\verify.json"