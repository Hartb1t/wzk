import subprocess
import sys

def check_version(command, name):
    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, check=True
        )
        # 处理java -version输出到stderr的特殊情况
        if result.stderr and not result.stdout:
            version = result.stderr.strip().split('\n')[0]
        else:
            version = result.stdout.strip().split('\n')[0]
        print(f"✅ {name} 版本: {version}")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ {name} 未安装或配置错误")
        return False

if __name__ == "__main__":
    print("="*30)
    print("  GIS全栈开发环境自检工具")
    print("="*30)
    
    all_ok = True
    # 检查所有实验要求的环境
    all_ok &= check_version("node -v", "Node.js")
    all_ok &= check_version("pnpm -v", "pnpm")
    all_ok &= check_version("python --version", "Python")
    all_ok &= check_version("java -version", "JDK")
    all_ok &= check_version("mvn -v", "Maven")
    all_ok &= check_version("git --version", "Git")
    
    print("\n" + "="*30)
    print("  自检结果")
    print("="*30)
    
    if all_ok:
        print("🎉 所有环境配置正常，可以开始开发！")
    else:
        print("⚠️ 部分环境配置异常，请检查后重试。")
        sys.exit(1)